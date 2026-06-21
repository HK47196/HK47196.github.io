# Projects

Selected projects showing troubleshooting, QA, systems, application support, parsing, and full-stack development skills.

For a concise production support example, see [Application Support Case Studies](/application-support-case-studies/).

## [P3 Loader](https://github.com/HK47196/ghidra-p3-exp-loader)

Ghidra loader for Phar Lap P3 flat-model `.EXP` executables.

- Imports a niche DOS extender executable format into Ghidra for reverse-engineering work.
- Uses Java, the Ghidra loader API, Gradle, binary parsing, image layout reconstruction, and import-log reporting.
- Documents supported signatures, import behavior, build/install steps, and known limitations such as relocation and symbol handling.
- Separates what the loader can safely import from what it only reports, which matters when debugging unfamiliar binaries.

## [URL Shortener](https://github.com/HK47196/url-shortener)

TypeScript/Express/React/PostgreSQL URL shortening service.

- Implements REST workflows for creating, resolving, revoking, and administering shortened URLs.
- Uses TypeScript, Express, React, PostgreSQL, Docker Compose, SQL-backed click analytics, revocation, a domain blacklist, and an admin dashboard.
- Includes vitest-based tests and a repeatable Docker Compose setup for local database/application troubleshooting.
- Connects API behavior, database records, admin state, and user-visible analytics in one small application.

## [MicroRules, a tiny C# DSL](https://github.com/HK47196/MicroRules)

C# expression language that parses and compiles runtime expressions into callable .NET functions.

- Keeps business-style rules compact without scattering conditional logic through application code.
- Uses C#, .NET, lexer/parser/compiler work, typed delegates, match expressions, lambda/LINQ support, and runtime compilation.
- Includes examples, tests, and benchmarks, with attention to predictable behavior for invalid or edge-case expressions.
- Turns ambiguous text input into diagnosable parser/compiler behavior with tests around the hard edges.

## [OMF Parser](https://github.com/HK47196/OMF-Parser)

Python parser/dumper for Relocatable Object Module Format (OMF) files.

- Parses and dumps OMF object files based on the TIS Specification v1.1 and related extensions.
- Uses Python, binary parsing, validation, structured dumping, docs, tests, and package/build metadata.
- Focuses on careful interpretation of legacy file records rather than guessy string processing.
- Makes parsed state visible so malformed or surprising data is easier to reason about.

## [GhidraMCP](https://github.com/HK47196/GhidraMCP)

MCP server integration for Ghidra.

- Connects MCP clients to Ghidra reverse-engineering functionality through a tooling/integration layer.
- Uses Python bridge code, Ghidra integration pieces, MCP server concepts, build documentation, tests, and test infrastructure.
- Kept here as tooling/integration evidence rather than a claim about production support experience.

## [phpBB 3.3.x OIDC Provider](https://github.com/HK47196/phpbb-oidc-provider)

Client-created WIP extension to make a phpBB forum function as an OIDC provider.

- Addresses an integration need inside an existing PHP/phpBB application rather than a greenfield app.
- Uses PHP, phpBB extension structure, OAuth2/OpenID Connect concepts, Composer dependencies, migrations, configuration, and encrypted token/code handling.
- Repository notes that it was created for a client and is not ready for general use; I treat it as WIP integration work.
- The support angle is practical: existing application code, framework conventions, and security-sensitive configuration.

## [Tsugaru FM-Towns Emulator Fork](https://github.com/HK47196/TOWNSEMU/tree/feature/tracing)

Fork of the Tsugaru emulator that adds instruction-level tracing of memory reads/writes, CALLs, and RETs for reverse-engineering support.

- Adds targeted diagnostics to an existing C++ emulator instead of building a separate tracing tool.
- Helps investigate runtime behavior by making memory access and call flow visible.
- The support angle is systems-level debugging and careful changes in someone else's codebase.

## Other projects

### [Tolkien Quest Character Sheet](https://hk47196.github.io/tolkien-quest/)

Character sheet based upon the old Tolkien Quest books. Includes saving and loading, allows the entire form to be filled out, and attempts to look as close as possible to the character sheet page itself.

### [Vapors](https://hk47196.github.io/vapors/)

Demo clone of the Steam store search page built with React and miragejs to mock the backend. It was created for WebKit-based browsers and may have issues in Mozilla-based browsers.

### [Finance](https://hk47196.github.io/finance/)

Sample finance app frontend built with React and JavaScript.

## Open source contributions

More open source contributions are on my [GitHub profile](https://github.com/HK47196).

## Stack Overflow

I have had a Stack Overflow account for many years. While I'm not very active, you can find the account [here](https://stackoverflow.com/users/754018/roxerio).
