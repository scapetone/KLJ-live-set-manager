#!/usr/bin/env python3
"""Build and verify the six-file user distribution. Python standard library only."""
import hashlib
from pathlib import Path
import tempfile
from zipfile import ZipFile, ZipInfo, ZIP_DEFLATED

ROOT = Path(__file__).resolve().parents[1]
VERSION = '1.6.0'
FILES = {
    'KLJ Live Set Manager.amxd': ROOT / 'device/KLJ Live Set Manager.amxd',
    'klj.engine.js': ROOT / 'device/klj.engine.js',
    'klj.model.js': ROOT / 'device/klj.model.js',
    'klj.ui.js': ROOT / 'device/klj.ui.js',
    'klj.runner.js': ROOT / 'device/klj.runner.js',
    'README.txt': ROOT / 'docs/README-user.txt',
}


def main():
    destination = ROOT / f'dist/KLJ-Live-Set-Manager-v{VERSION}.zip'
    destination.parent.mkdir(exist_ok=True)
    assert FILES['KLJ Live Set Manager.amxd'].read_bytes().startswith(b'ampf')
    with ZipFile(destination, 'w', compression=ZIP_DEFLATED, compresslevel=9) as archive:
        for name, source in FILES.items():
            # Stable timestamps/permissions: identical input produces an identical ZIP.
            entry = ZipInfo(name, date_time=(1980, 1, 1, 0, 0, 0))
            entry.create_system = 3
            entry.external_attr = 0o100644 << 16
            entry.compress_type = ZIP_DEFLATED
            archive.writestr(entry, source.read_bytes(), compresslevel=9)
    with ZipFile(destination) as archive, tempfile.TemporaryDirectory(prefix='klj-package-') as clean:
        assert archive.namelist() == list(FILES), 'Unexpected distribution contents'
        assert archive.testzip() is None
        archive.extractall(clean)
        extracted = Path(clean)
        assert {p.name for p in extracted.iterdir()} == set(FILES)
        for name, source in FILES.items():
            assert (extracted / name).read_bytes() == source.read_bytes(), name
        # Max resolves these adjacent files by name; the runtime paths are unchanged.
        for name in ('klj.engine.js', 'klj.runner.js'):
            assert (extracted / name).is_file()
        engine = (extracted / 'klj.engine.js').read_text()
        assert 'include("klj.model.js")' in engine and 'include("klj.ui.js")' in engine
    print(destination)
    print('OK: exactly six files, clean-directory extraction and byte comparisons passed')
    print('SHA-256:', hashlib.sha256(destination.read_bytes()).hexdigest())


if __name__ == '__main__':
    main()
