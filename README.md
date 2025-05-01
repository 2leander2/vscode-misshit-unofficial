# Unofficial MISS_HIT VS Code extension

Unofficial VS Code extension that integrates MISS_HIT linting and styling tools for MATLAB code. This extension provides real-time feedback about code quality and style issues directly in your VS Code editor.

## Features

- Automatically runs MISS_HIT linting and styling checks when MATLAB files are saved
- Displays lint warnings and errors in the editor with appropriate severity levels
- Runs `mh_style --fix` to automatically fix style issues when possible
- Provides a command to manually run linting and styling checks
- Shows precise locations of issues with clear messages and error codes

## Requirements

- Visual Studio Code 1.99.0 or newer
- [MISS_HIT](https://github.com/florianschanda/miss_hit) must be installed and available in your PATH
  - Install via pip: `pip install miss_hit`
  - Verify installation by running `mh_lint --version` and `mh_style --version` in your terminal

## Usage

1. Open a MATLAB file in VS Code
2. The extension will automatically run MISS_HIT checks when you save the file
3. Issues will be highlighted directly in your code with hover messages explaining the problems
4. Run checks manually using the command palette:
   - Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on macOS)
   - Type `MISS_HIT: Run Lint + Style`

## Known Issues

- Requires MISS_HIT to be installed and in PATH
- No configuration options
- Style auto-fixes require saving the file again to see changes

## Planned Features

- Configuration options through VS Code settings
- Support for MISS_HIT project configuration files
- Quick fixes for common issues
- Test integration
- Proper logging
- Store presence

## Release Notes

### 0.0.1

- Initial release
- Basic integration with mh_lint and mh_style
- Automatic checking on file save
- Command palette integration

---

## About MISS_HIT

[MISS_HIT](https://github.com/florianschanda/miss_hit) is a set of tools specifically designed for MATLAB code quality. It includes:

- **mh_lint**: A static analyzer for MATLAB and Octave code
- **mh_style**: A tool for enforcing a consistent coding style
- **mh_metric**: A tool for code metrics analysis

This extension integrates the linting and styling capabilities directly into VS Code.
