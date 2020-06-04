module.exports = {
    runner: 'jest-serial-runner',
    transformIgnorePatterns: [
        'node_modules/(?!(react|@testing-library/react-hooks)/)',
    ],
};
