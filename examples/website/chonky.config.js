/** @type {import('@chonkylang/transpiler').ChonkyConfig} */
module.exports = {
  verification: {
    strictBinding: true,
  },
  ambiguity: {
    policyManifest: './pm-requirement.json',
    strictMode: false,
    generateReport: true,
    reportPath: '.chonky/ambiguity-report.json',
  },
  optimizer: {
    silentMode: {
      imageFormatConversion: true,
      sizeReductionThreshold: 0.3,
    },
  },
};
