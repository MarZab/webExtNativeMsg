"use strict";
/* api */
const {URL} = require("url");
const {
  convertUriToFilePath, createDir, createFile, getAbsPath,
  getFileNameFromFilePath, getFileTimestamp, getStat, isDir,
  isExecutable, isFile, isSubDir, removeDir, readFile,
} = require("../modules/file-util");
const {assert} = require("chai");
const {after, describe, it} = require("mocha");
const fs = require("fs");
const os = require("os");
const path = require("path");
const process = require("process");

/* constants */
const {IS_WIN} = require("../modules/constant");
const PERM_EXEC = 0o700;
const PERM_FILE = 0o600;
const TMPDIR = process.env.TMP || process.env.TMPDIR || process.env.TEMP ||
               os.tmpdir();

describe("convertUriToFilePath", () => {
  it("should get string", () => {
    const p = path.resolve("foo/bar");
    let u;
    if (IS_WIN) {
      const reg = new RegExp(`\\${path.sep}`, "g");
      u = (new URL(`file:///${p.replace(reg, "/")}`)).href;
    } else {
      u = (new URL(`file://${p}`)).href;
    }
    assert.strictEqual(convertUriToFilePath(u), p);
  });

  it("should get string", () => {
    const p = path.resolve("foo/bar baz");
    let u;
    if (IS_WIN) {
      const reg = new RegExp(`\\${path.sep}`, "g");
      u = (new URL(`file:///${p.replace(reg, "/")}`)).href;
    } else {
      u = (new URL(`file://${p}`)).href;
    }
    assert.strictEqual(convertUriToFilePath(u), p);
  });

  it("should get string", () => {
    const p = path.resolve("/foo/bar/baz");
    let u;
    if (IS_WIN) {
      const reg = new RegExp(`\\${path.sep}`, "g");
      u = (new URL(`file:///${p.replace(reg, "/")}`)).href;
    } else {
      u = (new URL(`file://${p}`)).href;
    }
    assert.strictEqual(convertUriToFilePath(u), p);
  });

  it("should get string", () => {
    const p = path.resolve("/foo/bar/baz");
    let u;
    if (IS_WIN) {
      const reg = new RegExp(`\\${path.sep}`, "g");
      u = (new URL(`file://localhost/${p.replace(reg, "/")}`)).href;
    } else {
      u = (new URL(`file://localhost${p}`)).href;
    }
    assert.strictEqual(convertUriToFilePath(u), p);
  });

  it("should throw if string is not given", () => {
    assert.throws(() => convertUriToFilePath(),
                  "Expected String but got Undefined");
  });

  it("should get null if protocol does not match", () => {
    const uri = "http://example.com";
    assert.isNull(convertUriToFilePath(uri));
  });
});

describe("createDir", () => {
  const dirArr = [TMPDIR, "webextnativemsg"];
  const dirString = path.join(TMPDIR, "webextnativemsg");

  after(() => {
    fs.rmdirSync(dirString);
  });

  it("should get string", () => {
    const dir = createDir(dirArr);
    assert.strictEqual(dir, dirString);
  });

  it("should get null if given array is empty", () => {
    assert.isNull(createDir([]));
  });

  it("should throw if given argument is not an array", () => {
    assert.throws(() => createDir(), "Expected Array but got Undefined.");
  });
});

describe("createFile", () => {
  it("should get string", async () => {
    const dirPath = path.join(TMPDIR, "webextnativemsg");
    fs.mkdirSync(dirPath);
    const filePath = path.join(dirPath, "test.txt");
    const value = "test file.\n";
    const file = await createFile(filePath, value, {
      encoding: "utf8", flag: "w", mode: PERM_FILE,
    });
    assert.strictEqual(file, filePath);
    fs.unlinkSync(file);
    fs.rmdirSync(dirPath);
  });

  it("should throw if first argument is not a string", () => {
    createFile().catch(e => {
      assert.strictEqual(e.message, "Expected String but got Undefined.");
    });
  });

  it(
    "should throw if second argument is not string, buffer, uint8array",
    () => {
      const file = path.join(TMPDIR, "webextnativemsg", "test.txt");
      createFile(file).catch(e => {
        assert.strictEqual(
          e.message,
          "Expected String, Buffer, Uint8Array but got Undefined."
        );
      });
    }
  );
});

describe("removeDir", () => {
  it("should remove dir and it's files", async () => {
    const dirPath = path.join(TMPDIR, "webextnativemsg");
    fs.mkdirSync(dirPath);
    const filePath = path.join(dirPath, "test.txt");
    const value = "test file.\n";
    await createFile(filePath, value, {
      encoding: "utf8", flag: "w", mode: PERM_FILE,
    });
    const res1 = await Promise.all([
      fs.existsSync(filePath),
      fs.existsSync(dirPath),
    ]);
    removeDir(dirPath, TMPDIR);
    const res2 = await Promise.all([
      fs.existsSync(filePath),
      fs.existsSync(dirPath),
    ]);
    assert.deepEqual(res1, [true, true]);
    assert.deepEqual(res2, [false, false]);
  });

  it("should ignore if dir is not a directory", () => {
    const foo = path.resolve("foo");
    assert.isFalse(isDir(foo));
    assert.doesNotThrow(() => removeDir(foo, TMPDIR));
  });

  it("should throw if dir is not subdirectory of base dir", async () => {
    const dirPath = path.join(TMPDIR, "webextnativemsg");
    const foo = path.join(TMPDIR, "foo");
    await fs.mkdirSync(dirPath);
    await fs.mkdirSync(foo);
    assert.throws(() => removeDir(foo, dirPath));
    await fs.rmdirSync(dirPath);
    await fs.rmdirSync(foo);
  });
});

describe("getAbsPath", () => {
  it("should get string", () => {
    const p = "test.txt";
    const n = path.resolve(p);
    assert.strictEqual(getAbsPath(p), n);
  });

  it("should get null if string is not given", () => {
    assert.isNull(getAbsPath());
  });
});

describe("getFileNameFromFilePath", () => {
  it("should get string", () => {
    const p = path.resolve(path.join("test", "file", "test.sh"));
    assert.strictEqual(getFileNameFromFilePath(p), "test");
  });

  it("should get default string", () => {
    const p = path.resolve(path.join("test", "file"));
    assert.strictEqual(getFileNameFromFilePath(p), "index");
  });
});

describe("getFileTimestamp", () => {
  it("should get positive integer", () => {
    const p = path.resolve(path.join("test", "file", "test.sh"));
    assert.isAbove(getFileTimestamp(p), 0);
  });

  it("should get 0 if file does not exist", () => {
    const p = path.resolve(path.join("test", "file", "foo.txt"));
    assert.strictEqual(getFileTimestamp(p), 0);
  });
});

describe("getStat", () => {
  it("should be an object", () => {
    const p = path.resolve(path.join("test", "file", "test.sh"));
    assert.property(getStat(p), "mode");
  });

  it("should get null if given argument is not string", () => {
    assert.isNull(getStat());
  });

  it("should get null if file does not exist", () => {
    const p = path.resolve(path.join("test", "file", "foo.txt"));
    assert.isNull(getStat(p));
  });
});

describe("isDir", () => {
  it("should get true if dir exists", () => {
    const p = path.resolve(path.join("test", "file"));
    assert.strictEqual(isDir(p), true);
  });

  it("should get false if dir does not exist", () => {
    const p = path.resolve(path.join("test", "foo"));
    assert.strictEqual(isDir(p), false);
  });
});

describe("isExecutable", () => {
  it("should get true if file is executable", () => {
    const p = path.resolve(
      IS_WIN && path.join("test", "file", "test.cmd") ||
      path.join("test", "file", "test.sh")
    );
    fs.chmodSync(p, PERM_EXEC);
    assert.strictEqual(isExecutable(p), true);
  });

  it("should get false if file is not executable", () => {
    const p = path.resolve(path.join("test", "file", "test.txt"));
    assert.strictEqual(isExecutable(p), false);
  });
});

describe("isFile", () => {
  it("should get true if file exists", () => {
    const p = path.resolve(path.join("test", "file", "test.txt"));
    assert.strictEqual(isFile(p), true);
  });

  it("should get false if file does not exist", () => {
    const p = path.resolve(path.join("test", "file", "foo.txt"));
    assert.strictEqual(isFile(p), false);
  });
});

describe("isSubDir", () => {
  it("should get true if dir is subdirectory of base dir", () => {
    const d = path.resolve(path.join("test", "file"));
    const b = path.resolve("test");
    assert.strictEqual(isSubDir(d, b), true);
  });

  it("should get false if dir is not subdirectory of base dir", () => {
    const d = path.resolve("foo");
    const b = path.resolve("test");
    assert.strictEqual(isSubDir(d, b), false);
  });
});

describe("readFile", () => {
  it("should throw", async () => {
    await readFile("foo/bar").catch(e => {
      assert.strictEqual(e.message, "foo/bar is not a file.");
    });
  });

  it("should get file", async () => {
    const p = path.resolve(path.join("test", "file", "test.txt"));
    const opt = {encoding: "utf8", flag: "r"};
    const file = await readFile(p, opt);
    assert.strictEqual(file, "test file\n");
  });
});
