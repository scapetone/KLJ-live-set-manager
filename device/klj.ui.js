/* Native Max editor; the grid is a view, never the persistent source of truth. */
var KLJView = (function () {
    function View(parent, namespace) {
        this.editor = parent.getnamed("editor").subpatcher();
        this.headers = this.editor.getnamed("headers");
        this.clips = this.editor.getnamed("clips");
        this.clipHeader = this.editor.getnamed("clip_header");
        this.active = "—";
        this.warningVisible = false;
        this.warningText = "";
        this.rowHeight = 32;
        this.state = null;
        this.tracks = [];
        this.width = 1180; this.height = 760;
        this.gridRect = [20, 138, 1140, 522];
        this.grid = this.editor.getnamed("grid");
        this.menu = this.editor.getnamed("cellmenu");
        this.script = this.editor.getnamed("script");
        this.scriptDict = new Dict(namespace + "_editor_text");
        this.selected = null;
        this.details = false;
        this.loading = false;
        this.loadedScript = null;
        this.loadedRow = null;
        this.menuTarget = null;
        this.mouseClickPending = false;
        this.traceNames = false;
        this.cellAnchor = [310, 134];
        this.mouseX = 20;
        this.mouseY = 120;
        // Keep CLIP's vertical scrolling enabled for native vsync. Its 18 px scrollbar
        // sits behind the parameter pane, so only the right-hand scrollbar is visible.
        this.editor.bringtofront(this.grid);
        this.editor.bringtofront(this.editor.getnamed("script_header"));
        ["script_dot", "script_label", "script", "script_close", "warning_icon", "status_label", "warning_close"].forEach(function (name) {
            this.editor.bringtofront(this.editor.getnamed(name));
        }, this);
    }
    View.prototype.status = function (active, text) {
        this.active = active;
        if (this.state) this.highlight(this.state);
        this.editor.getnamed("active_label").message("set", "●  ACTIVE · " + active);
        // Presentation only: keep the engine's status, sequencing and persistence untouched.
        var normal = /^(Initializing|Ready|Configuration applied|Configurations restored|Track list updated)/.test(text);
        var attention = /duplicate|ambigu|no playable MIDI tracks/i.test(text) || !normal;
        var warning = attention ? String(text) : "";
        var changed = warning !== this.warningText || !!warning !== this.warningVisible;
        this.warningText = warning;
        this.warningVisible = !!warning;
        this.editor.getnamed("status_label").message("set", warning);
        this.showWarning();
        if (changed) this.layout(true);
    };
    View.prototype.showWarning = function () {
        ["warning_panel", "warning_icon", "status_label", "warning_close"].forEach(function (name) {
            this.editor.getnamed(name).hidden = this.warningVisible ? 0 : 1;
        }, this);
    };
    View.prototype.hideMenu = function () {
        this.menu.hidden = 1;
        this.menuTarget = null;
    };
    View.prototype.scriptValue = function () {
        var value = this.script.getvalueof();
        return (Array.isArray(value) ? value.join(" ") : String(value || "")).replace(/\r\n?/g, "\n");
    };
    View.prototype.flush = function (state, tracks, actions) {
        if (this.selected && !this.loading) this.event("script", [this.scriptValue()], state, tracks, actions);
    };
    View.prototype.selection = function (state) {
        // Changing selection must not clear the grid: that would dismiss its native text editor.
        this.highlight(state);
        var row = state.rows.find(function (r) {return r.id === this.selected;}, this);
        this.editor.getnamed("script_label").message("set", "JAVASCRIPT / " + (row ? row.clip : "No configuration"));
        if (this.loadedRow !== this.selected || this.loadedScript !== (row ? row.script : "")) {
            var wasLoading = this.loading;
            this.loading = true;
            try {
                // textedit uses carriage returns internally; bare LF is stripped on dictionary input.
                var displayText = row ? row.script.replace(/\r\n?/g, "\n").replace(/\n/g, "\r") : "";
                this.scriptDict.parse(JSON.stringify({text: displayText, mode: "set"}));
                this.script.message("dictionary", this.scriptDict.name);
                this.loadedScript = row ? row.script : "";
                this.loadedRow = this.selected;
            } finally {this.loading = wasLoading;}
        }
    };
    View.prototype.highlight = function (state) {
        state.rows.forEach(function (r, i) {
            var active = r.clip === this.active, selected = r.id === this.selected;
            var background = active ? (selected ? [36, 76, 65] : [26, 57, 49])
                : (selected ? [45, 55, 69] : (i % 2 ? [27, 32, 41] : [23, 27, 35]));
            this.grid.message("row", i, "brgb", ...background);
            this.clips.message("row", i, "brgb", ...background);
            this.clips.message("cell", 0, i, "brgb", ...(active ? [39, 79, 65] : background));
            this.clips.message("cell", 0, i, "frgb", ...(active ? [116, 212, 172] : [243, 245, 249]));
        }, this);
    };
    View.prototype.place = function (name, rect) {
        this.editor.getnamed(name).setboxattr("presentation_rect", rect);
    };
    View.prototype.headerLabels = function () {
        return ["CLIP", "BPM", "ROOT", "SCALE"].concat(this.tracks.map(function (t, i) {
            var prefix = t.position + " — ", suffix = t.ambiguous ? " ⚠" : "";
            var budget = Math.max(5, Math.floor(((this.columnWidths || [])[i + 4] || 122) / 8.5) - 1);
            var chars = Array.from(t.name), available = Math.max(2, budget - prefix.length - suffix.length);
            var name = chars.length > available ? chars.slice(0, available - 1).join("") + "…" : t.name;
            return prefix + name + suffix;
        }, this), ["PUSH", "MORE"]);
    };
    View.prototype.updateWidths = function () {
        var widths = [200, 64, 78, 176].concat(this.tracks.map(function () {return 122;}), [190, 60]);
        var weights = [2, 0, 0, 1].concat(this.tracks.map(function () {return 1;}), [2, 0]);
        var caps = [340, 64, 78, 230].concat(this.tracks.map(function () {return 160;}), [280, 60]);
        var extra = Math.max(0, this.gridRect[2] - 18 - widths.reduce(function (a, b) {return a + b;}, 0));
        // Distribute spare width without letting a long track name inflate its column.
        while (extra >= 1) {
            var totalWeight = weights.reduce(function (sum, weight, c) {return sum + (widths[c] < caps[c] ? weight : 0);}, 0);
            if (!totalWeight) break;
            var spent = 0;
            widths.forEach(function (w, c) {
                if (!weights[c] || w >= caps[c]) return;
                var add = Math.min(caps[c] - w, Math.max(1, Math.floor(extra * weights[c] / totalWeight)), extra - spent);
                widths[c] += add; spent += add;
            });
            if (!spent) break;
            extra -= spent;
        }
        this.columnWidths = widths;
        this.columnWidths.forEach(function (w, c) {
            if (c === 0) {
                this.clips.message("col", 0, "width", w);
                this.clipHeader.message("col", 0, "width", w);
            } else {
                this.grid.message("col", c - 1, "width", w);
                this.headers.message("col", c - 1, "width", w);
            }
        }, this);
        this.headerLabels().forEach(function (text, c) {(c === 0 ? this.clipHeader : this.headers).message("set", Math.max(0,c - 1), 0, text);}, this);
    };
    View.prototype.layout = function (force) {
        var size = this.editor.wind.size || [1180, 760];
        var width = Math.max(1, Number(size[0])), height = Math.max(1, Number(size[1]));
        if (!Number.isFinite(width) || !Number.isFinite(height)) return;
        if (!force && this.width === width && this.height === height) return;
        this.width = width; this.height = height;
        var wasLoading = this.loading;
        this.loading = true;
        try {
            this.hideMenu();
            var contentWidth = Math.max(1, width - 40);
            var actionY = Math.max(0, height - 62), contentBottom = Math.max(139, actionY - 18);
            var scriptBlock = this.details ? Math.min(Math.max(160, Math.floor(height * 0.28)), Math.max(0, contentBottom - (this.warningVisible ? 228 : 188))) : 0;
            var gridBottom = contentBottom - scriptBlock;
            var headerTop = this.warningVisible ? 112 : 72;
            var bodyTop = headerTop + 36;
            this.gridRect = [20, bodyTop, contentWidth, Math.max(1, gridBottom - bodyTop)];
            this.updateWidths();
            var clipWidth = this.columnWidths[0];
            this.parameterRect = [20 + clipWidth, bodyTop, Math.max(1, contentWidth - clipWidth), this.gridRect[3]];
            this.place("clips", [20, bodyTop, clipWidth + 18, Math.max(1,this.gridRect[3] - 18)]);
            this.place("clip_header", [20, headerTop, clipWidth, 36]);
            this.place("grid", this.parameterRect);
            this.place("headers", [20 + clipWidth, headerTop, Math.max(1, contentWidth - clipWidth - 18), 36]);
            this.place("title", [20, 16, Math.max(1, width * 0.52 - 30), 32]);
            this.place("active_label", [width * 0.52, 23, Math.max(1, width * 0.48 - 20), 24]);
            this.place("warning_panel", [20, 62, contentWidth, 36]);
            this.place("warning_icon", [30, 69, 22, 24]);
            this.place("status_label", [58, 69, Math.max(1, contentWidth - 82), 24]);
            this.place("warning_close", [width - 52, 68, 24, 24]);
            var gap = 12, buttonWidth = Math.min(150, Math.max(1, (contentWidth - gap * 3) / 4));
            ["add", "duplicate", "delete"].forEach(function (name, i) {
                this.place(name, [20 + i * (buttonWidth + gap), actionY, buttonWidth, 36]);
            }, this);
            var detailsWidth = Math.min(240, Math.max(1, contentWidth - 3 * (buttonWidth + gap)));
            this.place("details", [width - 20 - detailsWidth, actionY, detailsWidth, 36]);
            this.place("script_panel", [20, gridBottom + 16, contentWidth, Math.max(1, scriptBlock - 16)]);
            this.place("script_header", [21, gridBottom + 17, Math.max(1, contentWidth - 2), 34]);
            this.place("script_dot", [32, gridBottom + 23, 16, 24]);
            this.place("script_label", [52, gridBottom + 22, Math.max(1, contentWidth - 88), 24]);
            this.place("script_close", [width - 52, gridBottom + 22, 24, 24]);
            this.place("script", [28, gridBottom + 54, Math.max(1, contentWidth - 16), Math.max(1, scriptBlock - 64)]);
            this.grid.message("refresh"); this.headers.message("refresh");
            this.clips.message("refresh"); this.clipHeader.message("refresh");
        } finally {this.loading = wasLoading;}
    };
    View.prototype.showDetails = function (on) {
        this.details = !!on;
        ["script_panel", "script_header", "script_dot", "script_label", "script", "script_close"].forEach(function (name) {
            this.editor.getnamed(name).hidden = on ? 0 : 1;
        }, this);
        this.layout(true);
    };
    View.prototype.render = function (state, tracks) {
        this.state = state; this.tracks = tracks;
        this.loading = true;
        try {
            if (!state.rows.some(function (r) {return r.id === this.selected;}, this)) this.selected = state.rows.length ? state.rows[0].id : null;
            var headers = this.headerLabels();
            this.grid.message("cols", headers.length - 1);
            this.clips.message("rows", Math.max(1, state.rows.length));
            this.grid.message("rows", Math.max(1, state.rows.length));
            this.headers.message("cols", headers.length - 1);
            this.headers.message("rows", 1);
            // Replace titles in place: clear-all can erase synchronized header paints
            // during a body edit while scrolled. Shrinking cols already hides obsolete titles.
            this.clips.message("clear", "all");
            this.grid.message("clear", "all");
            headers.forEach(function (text, c) {
                var target = c === 0 ? this.clipHeader : this.headers, column = Math.max(0,c - 1);
                target.message("set", column, 0, text);
                target.message("cell", column, 0, "frgb", 243, 245, 249);
                target.message("cell", column, 0, "brgb", 49, 59, 73);
                if (c > 0) this.grid.message("col", column, "readonly", c === 1 ? 0 : 1);

            }, this);
            state.rows.forEach(function (r, i) {
                var push = tracks.find(function (t) {return t.key === r.push;});
                var values = [r.clip, r.bpm, KLJModel.ROOTS[r.root] + " ▾", r.scale + " ▾"]
                    .concat(tracks.map(function (t) {return r.enabled[t.key] ? "ON" : "OFF";}),
                        [(push ? push.position + " — " + push.name : "—") + " ▾", this.details && this.selected === r.id ? "−" : "+"]);
                values.forEach(function (value, c) {
                    var target = c === 0 ? this.clips : this.grid, column = Math.max(0,c - 1);
                    target.message("set", column, i, value);
                    var color = c >= 4 && c < 4 + tracks.length ? (r.enabled[tracks[c - 4].key] ? [116, 212, 172] : [224, 113, 125])
                        : (c === headers.length - 1 || c === headers.length - 2 ? [243, 186, 121] : [243, 245, 249]);
                    target.message("cell", column, i, "frgb", ...color);
                    if (c === 2 || c === 3 || c === 4 + tracks.length)
                        target.message("cell", column, i, "brgb", 29, 36, 47);
                }, this);
            }, this);
            this.layout(true);
            this.selection(state);
            this.grid.message("refresh");
            this.headers.message("refresh");
        } finally {this.loading = false;}
    };
    View.prototype.openMenu = function (row, field, tracks) {
        this.hideMenu();
        var choices;
        if (field === "root") choices = KLJModel.ROOTS.map(function (name, i) {return {label: name, value: i};});
        else if (field === "scale") choices = KLJModel.SCALES.map(function (name) {return {label: name, value: name};});
        else if (field === "push") choices = [{label: "— None", value: null}].concat(tracks.map(function (t) {
            return {label: t.position + " — " + t.name + (t.ambiguous ? " (ambiguous)" : ""), value: t.key};
        }));
        else return; // Legacy pushMode data is preserved, but has no UI control.
        this.menu.message("clear");
        choices.forEach(function (choice) {this.menu.message("append", choice.label);}, this);
        this.menu.message("set", Math.max(0, choices.findIndex(function (choice) {return choice.value === row[field];})));
        var rect = this.parameterRect || this.gridRect;
        var width = Math.min(field === "root" ? 100 : 270, rect[2]);
        var location = this.editor.wind.location;
        var pointerX = this.mouseX - location[0], pointerY = this.mouseY - location[1];
        var inGrid = pointerX >= rect[0] && pointerX < rect[0] + rect[2] && pointerY >= rect[1] && pointerY < rect[1] + rect[3];
        var x = Math.max(rect[0], Math.min(rect[0] + rect[2] - width, inGrid ? pointerX - 16 : this.cellAnchor[0]));
        var y = Math.max(rect[1], Math.min(rect[1] + rect[3] - 28, inGrid ? pointerY - 10 : this.cellAnchor[1]));
        // These are BOX attributes. Sending them as object messages is not reliable for umenu.
        // Always raise the selector over the grid in both patching and presentation views.
        this.menu.setboxattr("presentation_rect", [x, y, width, 28]);
        this.menu.setboxattr("patching_rect", [x, y, width, 28]);
        this.editor.bringtofront(this.menu);
        this.menu.ignoreclick = 0;
        this.menuTarget = {rowId: row.id, field: field, choices: choices};
        this.menu.hidden = 0;
    };
    View.prototype.activateCell = function (col, index, state, tracks, actions) {
        if (!Number.isInteger(col) || index < 0 || index >= state.rows.length) return;
        var row = state.rows[index];
        if (this.selected !== row.id) this.flush(state, tracks, actions);
        this.selected = row.id;
        this.hideMenu();
        this.selection(state);
        this.cellAnchor = [20 + this.columnWidths.slice(0, col).reduce(function (sum, w) {return sum + w;}, 0),
            this.gridRect[1] + index * this.rowHeight];
        if (col === 2) this.openMenu(row, "root", tracks);
        else if (col === 3) this.openMenu(row, "scale", tracks);
        else if (col >= 4 && col < 4 + tracks.length) {
            var track = tracks[col - 4];
            row.enabled[track.key] = row.enabled[track.key] ? 0 : 1;
            actions.changed();
        } else if (col === 4 + tracks.length) this.openMenu(row, "push", tracks);
        else if (col === 5 + tracks.length) {this.showDetails(!this.details); this.render(state, tracks);}
    };
    View.prototype.event = function (event, args, state, tracks, actions) {
        if (this.loading) return;
        // Keep the established logical columns (CLIP=0) at the UI boundary only.
        if (event === "parametercell") {args[0] = Number(args[0]) + 1; event = "cell";}
        if (event === "parametersync") {
            var selectAt = args[0] === "sync" ? 1 : 0;
            if (args[selectAt] === "select") args[selectAt + 1] = Number(args[selectAt + 1]) + 1;
            event = "sync";
        }
        var row = state.rows.find(function (r) {return r.id === this.selected;}, this);
        if (event === "dismiss") {
            this.warningVisible = false; this.showWarning(); this.layout(true); return;
        }
        if (event === "closedetails") {
            this.flush(state, tracks, actions); this.showDetails(false); return;
        }
        if (event === "layout") {this.layout(false); return;}
        if (event === "mousex") {this.mouseX = Number(args[0]); return;}
        if (event === "mousey") {this.mouseY = Number(args[0]); return;}
        if (event === "scriptchanged") {this.flush(state, tracks, actions); return;}
        if (event === "script") {
            if (args[0] === "text") args.shift();
            var source = (args.length ? String(args.join(" ")) : "").replace(/\r\n?/g, "\n");
            if (row && source !== row.script) {row.script = source; this.loadedScript = source; actions.changed();}
            return;
        }
        if (event === "menu") {
            var target = this.menuTarget;
            if (!target) return;
            var choice = target.choices[Number(args[0])];
            var targetRow = state.rows.find(function (r) {return r.id === target.rowId;});
            this.hideMenu();
            if (targetRow && choice) {targetRow[target.field] = choice.value; actions.changed();}
            return;
        }
        if (event === "sync") {
            if (String(args[0]) === "sync") args.shift();
            // Native order: sync click <mouse flags>, sync select <column,row>, cell value.
            // The click arguments are NOT cell coordinates. Pair it with the next select.
            if (args[0] === "click") this.mouseClickPending = true;
            else if (args[0] === "select") {
                var fromMouse = this.mouseClickPending;
                this.mouseClickPending = false;
                if (fromMouse) this.activateCell(Number(args[1]), Number(args[2]), state, tracks, actions);
            } else if (["scroll", "hscroll", "vscroll", "offset"].includes(args[0])) {
                this.mouseClickPending = false; this.hideMenu();
            }
            return;
        }
        if (event === "cell") {
            var col = Number(args.shift()), index = Number(args.shift());
            if (index < 0 || index >= state.rows.length) return;
            var selected = state.rows[index];
            if (selected.id !== this.selected) {this.flush(state, tracks, actions); this.selected = selected.id;}
            var text = args.join(" ");
            if (col < 2) {
                this.hideMenu();
                var replacement = KLJModel.clone(selected);
                if (col === 0) {
                    replacement.clip = KLJModel.normalizeName(text);
                    if (this.traceNames || text !== replacement.clip) post("KLJ cell name: " + JSON.stringify({
                        atoms: args, raw: text, rawLength: text.length,
                        name: replacement.clip, length: replacement.clip.length}) + "\n");
                }
                if (col === 1) replacement.bpm = Number(text);
                var candidate = KLJModel.clone(state); candidate.rows[index] = replacement;
                KLJModel.validate(candidate); // Reject invalid edits before touching the actual model.
                if (JSON.stringify(selected) !== JSON.stringify(replacement)) {
                    state.rows[index] = replacement;
                    actions.changed();
                } else this.selection(state);
            } else this.selection(state);
            return;
        }
        this.flush(state, tracks, actions);
        this.hideMenu();
        if (event === "add") this.selected = KLJModel.add(state, actions.defaults()).id;
        else if (event === "duplicate" && row) this.selected = KLJModel.add(state, actions.defaults(), row).id;
        else if (event === "delete" && row) {
            state.rows = state.rows.filter(function (r) {return r.id !== row.id;});
            this.selected = null;
        } else if (event === "details") this.showDetails(!this.details);
        actions.changed();
    };
    return View;
}());
