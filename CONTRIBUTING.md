# Contributing

We would love for you to contribute to our GitHub Repository and help make it even better than it is
today! As a contributor, here are the guidelines we would like you to follow:

- [Coding and testing local](#coding-and-testing-local)
- [Feature Requests](#feature-requests)
- [Submitting a Pull Request (PR)](#submitting-a-pull-request)
- [Coding Rules](#coding-rules)
- [Commit Message Guidelines](#commit-message-guidelines)

If something is not clear enough how to do what you want, this is a normal situation, just ask your
colleagues.

## Coding and testing local

Just look at
[README.md](https://github.com/Tren-Finance/Tren-Contracts/blob/f1f829a0ab41700aab3750b79a9f8e47f9fad11f/README.md)

## Issues and bugs

If you find a bug in the source code, you can help by submitting an issue or, even better, you can
submit a [Pull Request](#submitting-a-pull-request) with a fix.

## Sugmitting a Pull Request (PR)

Before you submit your Pull Request (PR) consider the following guidelines:

1. Search GitHub for an open or closed PR that relates to your submission. You don't want to
   duplicate effort.

2. Fork the Tren-contracts repo.

3. Make your changes in a new git branch:

```
git checkout -b my-fix-branch master
```

4. Create your patch, including appropriate test cases.

5. Follow our [Coding Rules](#coding-rules).

6. Run the full test suite, as described in [Coding and testing local](#coding-and-testing-local),
   and ensure that all tests pass.

7. Commit your changes using a descriptive commit message that follows our
   [commit message guidelines](#commite-message-guidelines).

```
git commit -a
```

Note: the optional commit -a command line option will automatically "add" and "rm" edited files.

8. Push your branch to GitHub:

```
git push origin my-fix-branch
```

9. In GitHub, send a pull request to master branch for review. Or you can use draft pull request if
   something will be changed again.

10. That's it! Thank you for your contribution!

## Coding Rules

To ensure consistency throughout the source code, keep these rules in mind as you are working:

- All features or bug fixes must be tested by one or more specs (unit-tests).
- We wrap all solidity code at 100 characters. An automated formatter is available.
- Add understandable commit message, in the future it will be so helpful for your teammate or even
  yourself to understand what did you do :D

## Commit Message Guidelines

We are using [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/), but with some
differences.

The commit message should be structured as follows:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Type** must be one of the following:

- build: Changes that affect the build system or external dependencies (example scopes: gulp,
  broccoli, npm)
- ci: Changes to our CI configuration files and scripts (example scopes: Travis, Circle,
  BrowserStack, SauceLabs)
- docs: Documentation only changes feat: A new feature
- fix: A bug fix
- perf: A code change that improves performance
- refactor: A code change that neither fixes a bug nor adds a feature
- style: Changes that do not affect the meaning of the code (white-space, formatting, missing
  semi-colons, etc)
- test: Adding missing tests or correcting existing tests

**Desription** should be in short format of what did you do.

### Examples

Common commit message with no body

```
docs: correct spelling of CHANGELOG
```

Commit message with description and breaking change footer

```
feat: allow provided config object to extend other configs
BREAKING CHANGE: `extends` key in config file is now used for extending other config files
```

**BREAKING CHANGE**: a commit that has a footer `BREAKING CHANGE:`, or appends a `!` after the
type/scope, introduces a breaking API change (correlating with MAJOR in Semantic Versioning). A
BREAKING CHANGE can be part of commits of any type.

Commit message with both ! and BREAKING CHANGE footer

```
fix!: drop support for Node 6

BREAKING CHANGE: use TypeScript features not available in Node 6.
```

Commit message with ! to draw attention to breaking change

```
feat!: new FlashLoan contract for borrow repaying
```
