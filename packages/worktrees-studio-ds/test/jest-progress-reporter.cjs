/**
 * Minimal Jest reporter: prints a live `[done/total · pct%]` progress line so a
 * long run is visibly working instead of looking frozen. The default reporter
 * still prints per-suite PASS/FAIL detail to stdout.
 */
class ProgressReporter {
  onRunStart(aggregatedResults) {
    this.total = Math.max(aggregatedResults.numTotalTestSuites || 1, 1);
    this.done = 0;
    this.suitesPassed = 0;
    this.suitesFailed = 0;
    this.testsPassed = 0;
    this.testsFailed = 0;
    this.startedAt = Date.now();
    this.isTty = Boolean(process.stderr.isTTY);
  }

  format(testPath) {
    const cwd = `${process.cwd()}/`;
    const name = testPath.startsWith(cwd) ? testPath.slice(cwd.length) : testPath;
    return name.length > 58 ? `…${name.slice(-57)}` : name;
  }

  onTestResult(test, testResult) {
    this.done += 1;
    const failed = testResult.numFailingTests > 0 || Boolean(testResult.testExecError);
    if (failed) this.suitesFailed += 1;
    else this.suitesPassed += 1;
    this.testsPassed += testResult.numPassingTests;
    this.testsFailed += testResult.numFailingTests;

    const pct = Math.floor((this.done / this.total) * 100);
    const elapsed = ((Date.now() - this.startedAt) / 1000).toFixed(0);
    const line =
      `[${String(this.done).padStart(3)}/${this.total} · ${String(pct).padStart(3)}%] ` +
      `${failed ? "✗" : "✓"} suites ${this.suitesPassed}/${this.total} · ` +
      `tests ${this.testsPassed}✓ ${this.testsFailed}✗ · ${elapsed}s · ${this.format(test.path)}`;

    if (this.isTty) process.stderr.write(`\r\x1b[K${line}`);
    else process.stderr.write(`${line}\n`);
  }

  onRunComplete(_contexts, results) {
    const seconds = ((Date.now() - this.startedAt) / 1000).toFixed(1);
    if (this.isTty) process.stderr.write("\r\x1b[K");
    process.stderr.write(
      `Done in ${seconds}s — ${results.numPassedTestSuites}/${results.numTotalTestSuites} suites passed, ` +
        `${results.numFailedTestSuites} failed · ${results.numPassedTests} tests passed, ` +
        `${results.numFailedTests} failed\n`
    );
  }
}

module.exports = ProgressReporter;
