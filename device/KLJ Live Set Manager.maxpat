{
  "patcher": {
    "fileversion": 1,
    "appversion": {
      "major": 9,
      "minor": 1,
      "revision": 5,
      "architecture": "arm64",
      "modernui": 1
    },
    "classnamespace": "box",
    "rect": [
      80,
      80,
      980,
      750
    ],
    "openinpresentation": 1,
    "default_fontsize": 13,
    "default_fontface": 0,
    "default_fontname": "Arial",
    "bgcolor": [
      0.07450980392156863,
      0.09411764705882353,
      0.12549019607843137,
      1
    ],
    "editing_bgcolor": [
      0.07450980392156863,
      0.09411764705882353,
      0.12549019607843137,
      1
    ],
    "boxes": [
      {
        "box": {
          "id": "title",
          "maxclass": "comment",
          "patching_rect": [
            10,
            5,
            340,
            24
          ],
          "text": "KLJ / LIVE MANAGER  V1.7.0",
          "presentation": 1,
          "presentation_rect": [
            10,
            5,
            340,
            24
          ],
          "textcolor": [
            0.9529411764705882,
            0.9607843137254902,
            0.9764705882352941,
            1
          ],
          "fontsize": 17,
          "fontface": 1
        }
      },
      {
        "box": {
          "id": "active",
          "maxclass": "comment",
          "patching_rect": [
            10,
            33,
            340,
            24
          ],
          "text": "—",
          "presentation": 1,
          "presentation_rect": [
            10,
            33,
            340,
            24
          ],
          "textcolor": [
            0.4549019607843137,
            0.8313725490196079,
            0.6745098039215687,
            1
          ],
          "fontsize": 17,
          "varname": "active"
        }
      },
      {
        "box": {
          "id": "status",
          "maxclass": "comment",
          "patching_rect": [
            10,
            63,
            340,
            49
          ],
          "text": "",
          "presentation": 1,
          "presentation_rect": [
            10,
            63,
            340,
            49
          ],
          "textcolor": [
            0.6627450980392157,
            0.7098039215686275,
            0.7764705882352941,
            1
          ],
          "fontsize": 11,
          "varname": "status",
          "hidden": 1
        }
      },
      {
        "box": {
          "id": "open",
          "maxclass": "textbutton",
          "patching_rect": [
            10,
            74,
            340,
            30
          ],
          "text": "OPEN CONFIGURATIONS",
          "presentation": 1,
          "presentation_rect": [
            10,
            74,
            340,
            30
          ],
          "texton": "OPEN CONFIGURATIONS",
          "bgcolor": [
            0.1450980392156863,
            0.17254901960784313,
            0.2196078431372549,
            1
          ],
          "textcolor": [
            0.9529411764705882,
            0.9607843137254902,
            0.9764705882352941,
            1
          ],
          "mode": 0,
          "outputmode": 1
        }
      },
      {
        "box": {
          "id": "midiin",
          "maxclass": "newobj",
          "patching_rect": [
            20,
            200,
            70,
            22
          ],
          "text": "midiin"
        }
      },
      {
        "box": {
          "id": "midiout",
          "maxclass": "newobj",
          "patching_rect": [
            20,
            240,
            70,
            22
          ],
          "text": "midiout"
        }
      },
      {
        "box": {
          "id": "ready",
          "maxclass": "newobj",
          "patching_rect": [
            160,
            200,
            90,
            22
          ],
          "text": "live.thisdevice"
        }
      },
      {
        "box": {
          "id": "restore_first",
          "maxclass": "newobj",
          "patching_rect": [
            160,
            240,
            70,
            22
          ],
          "text": "t b b"
        }
      },
      {
        "box": {
          "id": "defer",
          "maxclass": "newobj",
          "patching_rect": [
            160,
            280,
            70,
            22
          ],
          "text": "deferlow"
        }
      },
      {
        "box": {
          "id": "init_order",
          "maxclass": "newobj",
          "patching_rect": [
            160,
            320,
            70,
            22
          ],
          "text": "t b b"
        }
      },
      {
        "box": {
          "id": "init_engine",
          "maxclass": "message",
          "patching_rect": [
            160,
            360,
            40,
            22
          ],
          "text": "init"
        }
      },
      {
        "box": {
          "id": "init_runner",
          "maxclass": "message",
          "patching_rect": [
            280,
            360,
            40,
            22
          ],
          "text": "init"
        }
      },
      {
        "box": {
          "id": "engine",
          "maxclass": "newobj",
          "patching_rect": [
            160,
            430,
            114,
            22
          ],
          "text": "v8 klj.engine.js #0",
          "varname": "engine"
        }
      },
      {
        "box": {
          "id": "runner",
          "maxclass": "newobj",
          "patching_rect": [
            530,
            480,
            114,
            22
          ],
          "text": "v8 klj.runner.js #0",
          "varname": "runner"
        }
      },
      {
        "box": {
          "id": "state",
          "maxclass": "newobj",
          "patching_rect": [
            160,
            530,
            90,
            22
          ],
          "text": "pattr klj_state",
          "varname": "klj_state",
          "saved_attribute_attributes": {
            "valueof": {
              "parameter_longname": "KLJ Configurations",
              "parameter_shortname": "KLJ State",
              "parameter_type": 3,
              "parameter_invisible": 1
            }
          },
          "saved_object_attributes": {
            "parameter_enable": 1,
            "parameter_mappable": 0
          }
        }
      },
      {
        "box": {
          "id": "restore",
          "maxclass": "newobj",
          "patching_rect": [
            160,
            580,
            90,
            22
          ],
          "text": "prepend restore"
        }
      },
      {
        "box": {
          "id": "open_msg",
          "maxclass": "message",
          "patching_rect": [
            600,
            200,
            50,
            22
          ],
          "text": "open"
        }
      },
      {
        "box": {
          "id": "open_order",
          "maxclass": "newobj",
          "patching_rect": [
            720,
            200,
            70,
            22
          ],
          "text": "t b b"
        }
      },
      {
        "box": {
          "id": "opened_msg",
          "maxclass": "message",
          "patching_rect": [
            800,
            200,
            100,
            22
          ],
          "text": "editoropen"
        }
      },
      {
        "box": {
          "id": "window_open",
          "maxclass": "message",
          "patching_rect": [
            720,
            240,
            60,
            22
          ],
          "text": "open"
        }
      },
      {
        "box": {
          "id": "pcontrol",
          "maxclass": "newobj",
          "patching_rect": [
            600,
            240,
            70,
            22
          ],
          "text": "pcontrol"
        }
      },
      {
        "box": {
          "id": "editor",
          "maxclass": "newobj",
          "patching_rect": [
            600,
            280,
            70,
            22
          ],
          "text": "p editor",
          "varname": "editor",
          "patcher": {
            "fileversion": 1,
            "appversion": {
              "major": 9,
              "minor": 1,
              "revision": 5,
              "architecture": "arm64",
              "modernui": 1
            },
            "classnamespace": "box",
            "rect": [
              100,
              80,
              1180,
              760
            ],
            "openinpresentation": 1,
            "default_fontsize": 13,
            "default_fontface": 0,
            "default_fontname": "Arial",
            "bgcolor": [
              0.07450980392156863,
              0.09411764705882353,
              0.12549019607843137,
              1
            ],
            "editing_bgcolor": [
              0.07450980392156863,
              0.09411764705882353,
              0.12549019607843137,
              1
            ],
            "boxes": [
              {
                "box": {
                  "id": "title",
                  "maxclass": "comment",
                  "patching_rect": [
                    20,
                    16,
                    550,
                    32
                  ],
                  "text": "KLJ / LIVE MANAGER",
                  "presentation": 1,
                  "presentation_rect": [
                    20,
                    16,
                    550,
                    32
                  ],
                  "textcolor": [
                    0.9529411764705882,
                    0.9607843137254902,
                    0.9764705882352941,
                    1
                  ],
                  "fontsize": 24,
                  "fontface": 1,
                  "varname": "title"
                }
              },
              {
                "box": {
                  "id": "active_label",
                  "maxclass": "comment",
                  "patching_rect": [
                    650,
                    23,
                    510,
                    24
                  ],
                  "text": "●  ACTIVE · —",
                  "presentation": 1,
                  "presentation_rect": [
                    650,
                    23,
                    510,
                    24
                  ],
                  "textcolor": [
                    0.4549019607843137,
                    0.8313725490196079,
                    0.6745098039215687,
                    1
                  ],
                  "fontsize": 13,
                  "varname": "active_label"
                }
              },
              {
                "box": {
                  "id": "refreshtracks",
                  "maxclass": "textbutton",
                  "patching_rect": [
                    1006,
                    22,
                    154,
                    26
                  ],
                  "text": "REFRESH TRACKS",
                  "presentation": 1,
                  "presentation_rect": [
                    1006,
                    22,
                    154,
                    26
                  ],
                  "varname": "refreshtracks",
                  "texton": "REFRESH TRACKS",
                  "bgcolor": [
                    0.1450980392156863,
                    0.17254901960784313,
                    0.2196078431372549,
                    1
                  ],
                  "textcolor": [
                    0.6627450980392157,
                    0.7098039215686275,
                    0.7764705882352941,
                    1
                  ],
                  "mode": 0,
                  "fontsize": 11,
                  "rounded": 4
                }
              },
              {
                "box": {
                  "id": "refresh_msg",
                  "maxclass": "message",
                  "patching_rect": [
                    1100,
                    1100,
                    100,
                    22
                  ],
                  "text": "refreshtracks"
                }
              },
              {
                "box": {
                  "id": "editor_closed",
                  "maxclass": "newobj",
                  "patching_rect": [
                    1100,
                    1130,
                    70,
                    22
                  ],
                  "text": "closebang"
                }
              },
              {
                "box": {
                  "id": "closed_msg",
                  "maxclass": "message",
                  "patching_rect": [
                    1100,
                    1160,
                    100,
                    22
                  ],
                  "text": "editorclose"
                }
              },
              {
                "box": {
                  "id": "warning_panel",
                  "maxclass": "panel",
                  "patching_rect": [
                    20,
                    62,
                    1140,
                    36
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    20,
                    62,
                    1140,
                    36
                  ],
                  "varname": "warning_panel",
                  "hidden": 1,
                  "background": 1,
                  "bgcolor": [
                    0.18,
                    0.17,
                    0.16,
                    1
                  ],
                  "border": 1,
                  "bordercolor": [
                    0.34,
                    0.31,
                    0.27,
                    1
                  ],
                  "rounded": 6,
                  "ignoreclick": 1
                }
              },
              {
                "box": {
                  "id": "warning_icon",
                  "maxclass": "comment",
                  "patching_rect": [
                    30,
                    69,
                    22,
                    24
                  ],
                  "text": "⚠",
                  "presentation": 1,
                  "presentation_rect": [
                    30,
                    69,
                    22,
                    24
                  ],
                  "textcolor": [
                    0.9529411764705882,
                    0.7294117647058823,
                    0.4745098039215686,
                    1
                  ],
                  "fontsize": 13,
                  "hidden": 1,
                  "varname": "warning_icon"
                }
              },
              {
                "box": {
                  "id": "status_label",
                  "maxclass": "comment",
                  "patching_rect": [
                    58,
                    69,
                    1058,
                    24
                  ],
                  "text": "",
                  "presentation": 1,
                  "presentation_rect": [
                    58,
                    69,
                    1058,
                    24
                  ],
                  "textcolor": [
                    0.9529411764705882,
                    0.9607843137254902,
                    0.9764705882352941,
                    1
                  ],
                  "fontsize": 13,
                  "hidden": 1,
                  "varname": "status_label"
                }
              },
              {
                "box": {
                  "id": "warning_close",
                  "maxclass": "textbutton",
                  "patching_rect": [
                    1128,
                    68,
                    24,
                    24
                  ],
                  "text": "×",
                  "presentation": 1,
                  "presentation_rect": [
                    1128,
                    68,
                    24,
                    24
                  ],
                  "texton": "×",
                  "varname": "warning_close",
                  "hidden": 1,
                  "bgcolor": [
                    0.18,
                    0.17,
                    0.16,
                    1
                  ],
                  "textcolor": [
                    0.6627450980392157,
                    0.7098039215686275,
                    0.7764705882352941,
                    1
                  ],
                  "textoncolor": [
                    0.9529411764705882,
                    0.9607843137254902,
                    0.9764705882352941,
                    1
                  ],
                  "rounded": 4,
                  "mode": 0
                }
              },
              {
                "box": {
                  "id": "dismiss_msg",
                  "maxclass": "message",
                  "patching_rect": [
                    20,
                    1000,
                    70,
                    22
                  ],
                  "text": "dismiss"
                }
              },
              {
                "box": {
                  "id": "grid",
                  "maxclass": "jit.cellblock",
                  "patching_rect": [
                    20,
                    108,
                    1140,
                    570
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    20,
                    108,
                    1140,
                    570
                  ],
                  "varname": "grid",
                  "cols": 6,
                  "rows": 1,
                  "colhead": 0,
                  "rowhead": 0,
                  "rowheight": 32,
                  "colwidth": 140,
                  "selmode": 5,
                  "outmode": 0,
                  "hscroll": 1,
                  "vscroll": 1,
                  "hsync": 0,
                  "vsync": 1,
                  "selsync": 0,
                  "savemode": 0,
                  "bgcolor": [
                    0.07450980392156863,
                    0.09411764705882353,
                    0.12549019607843137,
                    1
                  ],
                  "fgcolor": [
                    0.9529411764705882,
                    0.9607843137254902,
                    0.9764705882352941,
                    1
                  ],
                  "textcolor": [
                    0.9529411764705882,
                    0.9607843137254902,
                    0.9764705882352941,
                    1
                  ],
                  "gridlinecolor": [
                    0.20784313725490197,
                    0.23921568627450981,
                    0.28627450980392155,
                    1
                  ],
                  "headercolor": [
                    0.1450980392156863,
                    0.17254901960784313,
                    0.2196078431372549,
                    1
                  ],
                  "hcellcolor": [
                    0.1450980392156863,
                    0.17254901960784313,
                    0.2196078431372549,
                    1
                  ],
                  "fontsize": 13
                }
              },
              {
                "box": {
                  "id": "headers",
                  "maxclass": "jit.cellblock",
                  "patching_rect": [
                    20,
                    72,
                    1122,
                    36
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    20,
                    72,
                    1122,
                    36
                  ],
                  "varname": "headers",
                  "cols": 6,
                  "rows": 1,
                  "colhead": 0,
                  "rowhead": 0,
                  "rowheight": 36,
                  "colwidth": 140,
                  "selmode": 0,
                  "readonly": 0,
                  "automouse": 0,
                  "hscroll": 0,
                  "vscroll": 0,
                  "hsync": 1,
                  "vsync": 0,
                  "selsync": 0,
                  "savemode": 0,
                  "bgcolor": [
                    0.19215686274509805,
                    0.23137254901960785,
                    0.28627450980392155,
                    1
                  ],
                  "fgcolor": [
                    0.9529411764705882,
                    0.9607843137254902,
                    0.9764705882352941,
                    1
                  ],
                  "textcolor": [
                    0.9529411764705882,
                    0.9607843137254902,
                    0.9764705882352941,
                    1
                  ],
                  "fontface": 1,
                  "fontsize": 13,
                  "gridlinecolor": [
                    0.20784313725490197,
                    0.23921568627450981,
                    0.28627450980392155,
                    1
                  ]
                }
              },
              {
                "box": {
                  "id": "clips",
                  "maxclass": "jit.cellblock",
                  "patching_rect": [
                    20,
                    108,
                    200,
                    552
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    20,
                    108,
                    200,
                    552
                  ],
                  "varname": "clips",
                  "cols": 1,
                  "rows": 1,
                  "colhead": 0,
                  "rowhead": 0,
                  "rowheight": 32,
                  "colwidth": 200,
                  "selmode": 5,
                  "outmode": 0,
                  "hscroll": 0,
                  "vscroll": 1,
                  "hsync": 0,
                  "vsync": 1,
                  "selsync": 0,
                  "savemode": 0,
                  "bgcolor": [
                    0.07450980392156863,
                    0.09411764705882353,
                    0.12549019607843137,
                    1
                  ],
                  "fgcolor": [
                    0.9529411764705882,
                    0.9607843137254902,
                    0.9764705882352941,
                    1
                  ],
                  "textcolor": [
                    0.9529411764705882,
                    0.9607843137254902,
                    0.9764705882352941,
                    1
                  ],
                  "fontsize": 13,
                  "gridlinecolor": [
                    0.20784313725490197,
                    0.23921568627450981,
                    0.28627450980392155,
                    1
                  ],
                  "hcellcolor": [
                    0.1450980392156863,
                    0.17254901960784313,
                    0.2196078431372549,
                    1
                  ]
                }
              },
              {
                "box": {
                  "id": "clip_header",
                  "maxclass": "jit.cellblock",
                  "patching_rect": [
                    20,
                    72,
                    200,
                    36
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    20,
                    72,
                    200,
                    36
                  ],
                  "varname": "clip_header",
                  "cols": 1,
                  "rows": 1,
                  "rowheight": 36,
                  "colwidth": 200,
                  "selmode": 0,
                  "readonly": 0,
                  "automouse": 0,
                  "hscroll": 0,
                  "vscroll": 0,
                  "hsync": 0,
                  "vsync": 0,
                  "selsync": 0,
                  "savemode": 0,
                  "bgcolor": [
                    0.19215686274509805,
                    0.23137254901960785,
                    0.28627450980392155,
                    1
                  ],
                  "fgcolor": [
                    0.9529411764705882,
                    0.9607843137254902,
                    0.9764705882352941,
                    1
                  ],
                  "textcolor": [
                    0.9529411764705882,
                    0.9607843137254902,
                    0.9764705882352941,
                    1
                  ],
                  "fontface": 1,
                  "fontsize": 13,
                  "gridlinecolor": [
                    0.20784313725490197,
                    0.23921568627450981,
                    0.28627450980392155,
                    1
                  ]
                }
              },
              {
                "box": {
                  "id": "header_bang",
                  "maxclass": "newobj",
                  "patching_rect": [
                    1050,
                    1000,
                    70,
                    22
                  ],
                  "text": "t b"
                }
              },
              {
                "box": {
                  "id": "header_defer",
                  "maxclass": "newobj",
                  "patching_rect": [
                    1050,
                    1030,
                    70,
                    22
                  ],
                  "text": "deferlow"
                }
              },
              {
                "box": {
                  "id": "header_refresh",
                  "maxclass": "message",
                  "patching_rect": [
                    1050,
                    1060,
                    65,
                    22
                  ],
                  "text": "refresh"
                }
              },
              {
                "box": {
                  "id": "cellmenu",
                  "maxclass": "umenu",
                  "patching_rect": [
                    20,
                    110,
                    260,
                    26
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    20,
                    110,
                    260,
                    26
                  ],
                  "varname": "cellmenu",
                  "hidden": 1,
                  "bgcolor": [
                    0.1450980392156863,
                    0.17254901960784313,
                    0.2196078431372549,
                    1
                  ],
                  "bgfillcolor": {
                    "type": "color",
                    "color": [
                      0.1450980392156863,
                      0.17254901960784313,
                      0.2196078431372549,
                      1
                    ]
                  },
                  "textcolor": [
                    0.9529411764705882,
                    0.9607843137254902,
                    0.9764705882352941,
                    1
                  ],
                  "elementcolor": [
                    0.6627450980392157,
                    0.7098039215686275,
                    0.7764705882352941,
                    1
                  ],
                  "items": [
                    "—"
                  ],
                  "menumode": 0,
                  "ignoreclick": 0,
                  "fontsize": 13
                }
              },
              {
                "box": {
                  "id": "add",
                  "maxclass": "textbutton",
                  "patching_rect": [
                    20,
                    666,
                    150,
                    30
                  ],
                  "text": "+ ADD",
                  "presentation": 1,
                  "presentation_rect": [
                    20,
                    666,
                    150,
                    30
                  ],
                  "texton": "+ ADD",
                  "bgcolor": [
                    0.4549019607843137,
                    0.8313725490196079,
                    0.6745098039215687,
                    1
                  ],
                  "bgoncolor": [
                    0.22,
                    0.57,
                    0.44,
                    1
                  ],
                  "textcolor": [
                    0.07450980392156863,
                    0.09411764705882353,
                    0.12549019607843137,
                    1
                  ],
                  "textoncolor": [
                    0.07450980392156863,
                    0.09411764705882353,
                    0.12549019607843137,
                    1
                  ],
                  "border": 1,
                  "bordercolor": [
                    0.34,
                    0.39,
                    0.46,
                    1
                  ],
                  "rounded": 6,
                  "fontsize": 13,
                  "mode": 0,
                  "outputmode": 1,
                  "varname": "add"
                }
              },
              {
                "box": {
                  "id": "msg_add",
                  "maxclass": "message",
                  "patching_rect": [
                    20,
                    835,
                    150,
                    22
                  ],
                  "text": "add"
                }
              },
              {
                "box": {
                  "id": "duplicate",
                  "maxclass": "textbutton",
                  "patching_rect": [
                    185,
                    666,
                    140,
                    30
                  ],
                  "text": "DUPLICATE",
                  "presentation": 1,
                  "presentation_rect": [
                    185,
                    666,
                    140,
                    30
                  ],
                  "texton": "DUPLICATE",
                  "bgcolor": [
                    0.1450980392156863,
                    0.17254901960784313,
                    0.2196078431372549,
                    1
                  ],
                  "bgoncolor": [
                    0.23,
                    0.28,
                    0.35,
                    1
                  ],
                  "textcolor": [
                    0.9529411764705882,
                    0.9607843137254902,
                    0.9764705882352941,
                    1
                  ],
                  "textoncolor": [
                    0.9529411764705882,
                    0.9607843137254902,
                    0.9764705882352941,
                    1
                  ],
                  "border": 1,
                  "bordercolor": [
                    0.34,
                    0.39,
                    0.46,
                    1
                  ],
                  "rounded": 6,
                  "fontsize": 13,
                  "mode": 0,
                  "outputmode": 1,
                  "varname": "duplicate"
                }
              },
              {
                "box": {
                  "id": "msg_duplicate",
                  "maxclass": "message",
                  "patching_rect": [
                    185,
                    835,
                    140,
                    22
                  ],
                  "text": "duplicate"
                }
              },
              {
                "box": {
                  "id": "delete",
                  "maxclass": "textbutton",
                  "patching_rect": [
                    340,
                    666,
                    140,
                    30
                  ],
                  "text": "DELETE",
                  "presentation": 1,
                  "presentation_rect": [
                    340,
                    666,
                    140,
                    30
                  ],
                  "texton": "DELETE",
                  "bgcolor": [
                    0.1450980392156863,
                    0.17254901960784313,
                    0.2196078431372549,
                    1
                  ],
                  "bgoncolor": [
                    0.23,
                    0.28,
                    0.35,
                    1
                  ],
                  "textcolor": [
                    0.9529411764705882,
                    0.9607843137254902,
                    0.9764705882352941,
                    1
                  ],
                  "textoncolor": [
                    0.9529411764705882,
                    0.9607843137254902,
                    0.9764705882352941,
                    1
                  ],
                  "border": 1,
                  "bordercolor": [
                    0.34,
                    0.39,
                    0.46,
                    1
                  ],
                  "rounded": 6,
                  "fontsize": 13,
                  "mode": 0,
                  "outputmode": 1,
                  "varname": "delete"
                }
              },
              {
                "box": {
                  "id": "msg_delete",
                  "maxclass": "message",
                  "patching_rect": [
                    340,
                    835,
                    140,
                    22
                  ],
                  "text": "delete"
                }
              },
              {
                "box": {
                  "id": "details",
                  "maxclass": "textbutton",
                  "patching_rect": [
                    920,
                    666,
                    240,
                    30
                  ],
                  "text": "JAVASCRIPT",
                  "presentation": 1,
                  "presentation_rect": [
                    920,
                    666,
                    240,
                    30
                  ],
                  "texton": "JAVASCRIPT",
                  "bgcolor": [
                    0.1450980392156863,
                    0.17254901960784313,
                    0.2196078431372549,
                    1
                  ],
                  "bgoncolor": [
                    0.23,
                    0.28,
                    0.35,
                    1
                  ],
                  "textcolor": [
                    0.9529411764705882,
                    0.9607843137254902,
                    0.9764705882352941,
                    1
                  ],
                  "textoncolor": [
                    0.9529411764705882,
                    0.9607843137254902,
                    0.9764705882352941,
                    1
                  ],
                  "border": 1,
                  "bordercolor": [
                    0.34,
                    0.39,
                    0.46,
                    1
                  ],
                  "rounded": 6,
                  "fontsize": 13,
                  "mode": 0,
                  "outputmode": 1,
                  "varname": "details"
                }
              },
              {
                "box": {
                  "id": "msg_details",
                  "maxclass": "message",
                  "patching_rect": [
                    920,
                    835,
                    240,
                    22
                  ],
                  "text": "details"
                }
              },
              {
                "box": {
                  "id": "script_panel",
                  "maxclass": "panel",
                  "patching_rect": [
                    20,
                    460,
                    1140,
                    180
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    20,
                    460,
                    1140,
                    180
                  ],
                  "varname": "script_panel",
                  "hidden": 1,
                  "background": 1,
                  "bgcolor": [
                    0.08,
                    0.1,
                    0.14,
                    1
                  ],
                  "border": 1,
                  "bordercolor": [
                    0.38,
                    0.43,
                    0.5,
                    1
                  ],
                  "rounded": 6,
                  "ignoreclick": 1
                }
              },
              {
                "box": {
                  "id": "script_header",
                  "maxclass": "panel",
                  "patching_rect": [
                    21,
                    461,
                    1138,
                    34
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    21,
                    461,
                    1138,
                    34
                  ],
                  "varname": "script_header",
                  "hidden": 1,
                  "background": 1,
                  "bgcolor": [
                    0.1450980392156863,
                    0.17254901960784313,
                    0.2196078431372549,
                    1
                  ],
                  "ignoreclick": 1
                }
              },
              {
                "box": {
                  "id": "script_dot",
                  "maxclass": "comment",
                  "patching_rect": [
                    32,
                    467,
                    16,
                    24
                  ],
                  "text": "●",
                  "presentation": 1,
                  "presentation_rect": [
                    32,
                    467,
                    16,
                    24
                  ],
                  "textcolor": [
                    0.9529411764705882,
                    0.7294117647058823,
                    0.4745098039215686,
                    1
                  ],
                  "fontsize": 13,
                  "hidden": 1,
                  "varname": "script_dot"
                }
              },
              {
                "box": {
                  "id": "script_label",
                  "maxclass": "comment",
                  "patching_rect": [
                    52,
                    466,
                    1052,
                    24
                  ],
                  "text": "JAVASCRIPT",
                  "presentation": 1,
                  "presentation_rect": [
                    52,
                    466,
                    1052,
                    24
                  ],
                  "textcolor": [
                    0.9529411764705882,
                    0.9607843137254902,
                    0.9764705882352941,
                    1
                  ],
                  "fontsize": 13,
                  "hidden": 1,
                  "varname": "script_label",
                  "fontface": 1
                }
              },
              {
                "box": {
                  "id": "script",
                  "maxclass": "textedit",
                  "patching_rect": [
                    28,
                    498,
                    1124,
                    132
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    28,
                    498,
                    1124,
                    132
                  ],
                  "hidden": 1,
                  "varname": "script",
                  "keymode": 0,
                  "outputmode": 1,
                  "bangmode": 0,
                  "wordwrap": 0,
                  "fontsize": 13,
                  "fontname": "Menlo",
                  "bgcolor": [
                    0.08,
                    0.1,
                    0.14,
                    1
                  ],
                  "textcolor": [
                    0.9529411764705882,
                    0.9607843137254902,
                    0.9764705882352941,
                    1
                  ],
                  "rounded": 4
                }
              },
              {
                "box": {
                  "id": "script_close",
                  "maxclass": "textbutton",
                  "patching_rect": [
                    1128,
                    466,
                    24,
                    24
                  ],
                  "text": "×",
                  "presentation": 1,
                  "presentation_rect": [
                    1128,
                    466,
                    24,
                    24
                  ],
                  "hidden": 1,
                  "varname": "script_close",
                  "texton": "×",
                  "bgcolor": [
                    0.1450980392156863,
                    0.17254901960784313,
                    0.2196078431372549,
                    1
                  ],
                  "textcolor": [
                    0.6627450980392157,
                    0.7098039215686275,
                    0.7764705882352941,
                    1
                  ],
                  "textoncolor": [
                    0.9529411764705882,
                    0.9607843137254902,
                    0.9764705882352941,
                    1
                  ],
                  "rounded": 4,
                  "mode": 0
                }
              },
              {
                "box": {
                  "id": "script_close_msg",
                  "maxclass": "message",
                  "patching_rect": [
                    160,
                    1000,
                    100,
                    22
                  ],
                  "text": "closedetails"
                }
              },
              {
                "box": {
                  "id": "cell_event",
                  "maxclass": "newobj",
                  "patching_rect": [
                    20,
                    885,
                    126,
                    22
                  ],
                  "text": "prepend parametercell"
                }
              },
              {
                "box": {
                  "id": "sync_event",
                  "maxclass": "newobj",
                  "patching_rect": [
                    165,
                    885,
                    126,
                    22
                  ],
                  "text": "prepend parametersync"
                }
              },
              {
                "box": {
                  "id": "menu_event",
                  "maxclass": "newobj",
                  "patching_rect": [
                    310,
                    885,
                    72,
                    22
                  ],
                  "text": "prepend menu"
                }
              },
              {
                "box": {
                  "id": "textchange",
                  "maxclass": "newobj",
                  "patching_rect": [
                    610,
                    800,
                    102,
                    22
                  ],
                  "text": "route textchanged"
                }
              },
              {
                "box": {
                  "id": "textdefer",
                  "maxclass": "newobj",
                  "patching_rect": [
                    610,
                    835,
                    70,
                    22
                  ],
                  "text": "deferlow"
                }
              },
              {
                "box": {
                  "id": "textbang",
                  "maxclass": "message",
                  "patching_rect": [
                    610,
                    865,
                    100,
                    22
                  ],
                  "text": "scriptchanged"
                }
              },
              {
                "box": {
                  "id": "clip_cell_event",
                  "maxclass": "newobj",
                  "patching_rect": [
                    20,
                    1100,
                    72,
                    22
                  ],
                  "text": "prepend cell"
                }
              },
              {
                "box": {
                  "id": "clip_sync_event",
                  "maxclass": "newobj",
                  "patching_rect": [
                    180,
                    1100,
                    72,
                    22
                  ],
                  "text": "prepend sync"
                }
              },
              {
                "box": {
                  "id": "mouse",
                  "maxclass": "newobj",
                  "patching_rect": [
                    800,
                    800,
                    70,
                    22
                  ],
                  "text": "mousestate",
                  "varname": "mouse"
                }
              },
              {
                "box": {
                  "id": "mouseload",
                  "maxclass": "newobj",
                  "patching_rect": [
                    800,
                    765,
                    90,
                    22
                  ],
                  "text": "loadmess mode 0"
                }
              },
              {
                "box": {
                  "id": "mousex",
                  "maxclass": "newobj",
                  "patching_rect": [
                    800,
                    835,
                    84,
                    22
                  ],
                  "text": "prepend mousex"
                }
              },
              {
                "box": {
                  "id": "mousey",
                  "maxclass": "newobj",
                  "patching_rect": [
                    920,
                    835,
                    84,
                    22
                  ],
                  "text": "prepend mousey"
                }
              },
              {
                "box": {
                  "id": "mousepoll",
                  "maxclass": "newobj",
                  "patching_rect": [
                    950,
                    765,
                    90,
                    22
                  ],
                  "text": "loadmess nopoll"
                }
              },
              {
                "box": {
                  "id": "layoutload",
                  "maxclass": "newobj",
                  "patching_rect": [
                    1060,
                    765,
                    70,
                    22
                  ],
                  "text": "loadmess 0"
                }
              },
              {
                "box": {
                  "id": "layoutclock",
                  "maxclass": "newobj",
                  "patching_rect": [
                    1060,
                    800,
                    70,
                    22
                  ],
                  "text": "qmetro 100",
                  "varname": "layoutclock"
                }
              },
              {
                "box": {
                  "id": "layoutmsg",
                  "maxclass": "message",
                  "patching_rect": [
                    1060,
                    835,
                    70,
                    22
                  ],
                  "text": "layout"
                }
              },
              {
                "box": {
                  "id": "window",
                  "maxclass": "newobj",
                  "patching_rect": [
                    800,
                    930,
                    70,
                    22
                  ],
                  "text": "thispatcher",
                  "varname": "window"
                }
              },
              {
                "box": {
                  "id": "events",
                  "maxclass": "newobj",
                  "patching_rect": [
                    455,
                    960,
                    70,
                    22
                  ],
                  "text": "outlet"
                }
              },
              {
                "box": {
                  "id": "control",
                  "maxclass": "newobj",
                  "patching_rect": [
                    1060,
                    800,
                    70,
                    22
                  ],
                  "text": "inlet"
                }
              }
            ],
            "lines": [
              {
                "patchline": {
                  "source": [
                    "refreshtracks",
                    0
                  ],
                  "destination": [
                    "refresh_msg",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "refresh_msg",
                    0
                  ],
                  "destination": [
                    "events",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "editor_closed",
                    0
                  ],
                  "destination": [
                    "closed_msg",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "closed_msg",
                    0
                  ],
                  "destination": [
                    "events",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "warning_close",
                    0
                  ],
                  "destination": [
                    "dismiss_msg",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "dismiss_msg",
                    0
                  ],
                  "destination": [
                    "events",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "grid",
                    2
                  ],
                  "destination": [
                    "clips",
                    1
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "clips",
                    2
                  ],
                  "destination": [
                    "grid",
                    1
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "grid",
                    2
                  ],
                  "destination": [
                    "headers",
                    1
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "grid",
                    2
                  ],
                  "destination": [
                    "header_bang",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "header_bang",
                    0
                  ],
                  "destination": [
                    "header_defer",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "header_defer",
                    0
                  ],
                  "destination": [
                    "header_refresh",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "header_refresh",
                    0
                  ],
                  "destination": [
                    "headers",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "header_refresh",
                    0
                  ],
                  "destination": [
                    "clips",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "header_refresh",
                    0
                  ],
                  "destination": [
                    "grid",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "clips",
                    2
                  ],
                  "destination": [
                    "header_bang",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "add",
                    0
                  ],
                  "destination": [
                    "msg_add",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "msg_add",
                    0
                  ],
                  "destination": [
                    "events",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "duplicate",
                    0
                  ],
                  "destination": [
                    "msg_duplicate",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "msg_duplicate",
                    0
                  ],
                  "destination": [
                    "events",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "delete",
                    0
                  ],
                  "destination": [
                    "msg_delete",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "msg_delete",
                    0
                  ],
                  "destination": [
                    "events",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "details",
                    0
                  ],
                  "destination": [
                    "msg_details",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "msg_details",
                    0
                  ],
                  "destination": [
                    "events",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "script_close",
                    0
                  ],
                  "destination": [
                    "script_close_msg",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "script_close_msg",
                    0
                  ],
                  "destination": [
                    "events",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "clips",
                    0
                  ],
                  "destination": [
                    "clip_cell_event",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "clip_cell_event",
                    0
                  ],
                  "destination": [
                    "events",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "clips",
                    2
                  ],
                  "destination": [
                    "clip_sync_event",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "clip_sync_event",
                    0
                  ],
                  "destination": [
                    "events",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "grid",
                    0
                  ],
                  "destination": [
                    "cell_event",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "grid",
                    2
                  ],
                  "destination": [
                    "sync_event",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "cellmenu",
                    0
                  ],
                  "destination": [
                    "menu_event",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "script",
                    3
                  ],
                  "destination": [
                    "textchange",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "textchange",
                    0
                  ],
                  "destination": [
                    "textdefer",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "textdefer",
                    0
                  ],
                  "destination": [
                    "textbang",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "textbang",
                    0
                  ],
                  "destination": [
                    "events",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "cell_event",
                    0
                  ],
                  "destination": [
                    "events",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "sync_event",
                    0
                  ],
                  "destination": [
                    "events",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "menu_event",
                    0
                  ],
                  "destination": [
                    "events",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "mouseload",
                    0
                  ],
                  "destination": [
                    "mouse",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "mousepoll",
                    0
                  ],
                  "destination": [
                    "mouse",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "mouse",
                    1
                  ],
                  "destination": [
                    "mousex",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "mouse",
                    2
                  ],
                  "destination": [
                    "mousey",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "mousex",
                    0
                  ],
                  "destination": [
                    "events",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "mousey",
                    0
                  ],
                  "destination": [
                    "events",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "layoutload",
                    0
                  ],
                  "destination": [
                    "layoutclock",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "layoutclock",
                    0
                  ],
                  "destination": [
                    "layoutmsg",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "layoutmsg",
                    0
                  ],
                  "destination": [
                    "events",
                    0
                  ]
                }
              }
            ],
            "title": "KLJ / LIVE MANAGER",
            "toolbarvisible": 0,
            "enablehscroll": 0,
            "enablevscroll": 0
          }
        }
      },
      {
        "box": {
          "id": "uievent",
          "maxclass": "newobj",
          "patching_rect": [
            600,
            360,
            70,
            22
          ],
          "text": "prepend ui"
        }
      }
    ],
    "lines": [
      {
        "patchline": {
          "source": [
            "midiin",
            0
          ],
          "destination": [
            "midiout",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "open_msg",
            0
          ],
          "destination": [
            "open_order",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "open_order",
            1
          ],
          "destination": [
            "opened_msg",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "opened_msg",
            0
          ],
          "destination": [
            "uievent",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "open_order",
            0
          ],
          "destination": [
            "window_open",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "window_open",
            0
          ],
          "destination": [
            "pcontrol",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "ready",
            0
          ],
          "destination": [
            "restore_first",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "restore_first",
            0
          ],
          "destination": [
            "defer",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "defer",
            0
          ],
          "destination": [
            "init_order",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "init_order",
            0
          ],
          "destination": [
            "init_engine",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "init_engine",
            0
          ],
          "destination": [
            "engine",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "engine",
            0
          ],
          "destination": [
            "state",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "state",
            0
          ],
          "destination": [
            "restore",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "restore",
            0
          ],
          "destination": [
            "engine",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "runner",
            0
          ],
          "destination": [
            "engine",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "open",
            0
          ],
          "destination": [
            "open_msg",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "pcontrol",
            0
          ],
          "destination": [
            "editor",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "editor",
            0
          ],
          "destination": [
            "uievent",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "uievent",
            0
          ],
          "destination": [
            "engine",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "restore_first",
            1
          ],
          "destination": [
            "state",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "init_order",
            1
          ],
          "destination": [
            "init_runner",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "init_runner",
            0
          ],
          "destination": [
            "runner",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "engine",
            1
          ],
          "destination": [
            "runner",
            0
          ]
        }
      }
    ],
    "devicewidth": 360,
    "parameters": {
      "state": [
        "KLJ Configurations",
        "KLJ State",
        0
      ],
      "parameterbanks": {},
      "inherited_shortname": 1
    },
    "dependency_cache": [
      {
        "name": "klj.engine.js",
        "type": "TEXT",
        "implicit": 1
      },
      {
        "name": "klj.model.js",
        "type": "TEXT",
        "implicit": 1
      },
      {
        "name": "klj.ui.js",
        "type": "TEXT",
        "implicit": 1
      },
      {
        "name": "klj.runner.js",
        "type": "TEXT",
        "implicit": 1
      }
    ]
  }
}
