from main import app as dhruva_app
import pytest
import sys
import pathlib

sys.path.append("..")


def pytest_collection_modifyitems(config, items):
    # python 3.4/3.5 compat: rootdir = pathlib.Path(str(config.rootdir))
    rootdir = pathlib.Path(config.rootdir)
    for item in items:
        rel_path = pathlib.Path(item.fspath).relative_to(rootdir)
        mark_name = next(
            (part for part in rel_path.parts if part.endswith("_tests")), ""
        ).removesuffix("_tests")
        if mark_name:
            mark = getattr(pytest.mark, mark_name)
            item.add_marker(mark)


@pytest.fixture()
def app():
    yield dhruva_app
