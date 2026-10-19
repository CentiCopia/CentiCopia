# CentiCopia

**Every account. One place. Your data.**

CentiCopia is a free, open-source personal finance manager designed to make tracking your money simple. Manage your bank accounts, credit cards, gift cards, and other financial accounts in one place—without subscriptions, unnecessary complexity, or a steep learning curve.

Your financial data belongs to you. CentiCopia is designed to store your data locally in a SQLite database, with optional cloud synchronization so you can choose how and where your data is backed up or shared between your devices.

## Project Goals

CentiCopia is built around a few straightforward principles:

- **Free forever:** Core functionality will remain free to use, with donations encouraged but never required.
- **Open source:** Anyone can inspect the code, contribute improvements, and build on the project according to its license.
- **Local-first:** Your financial data is stored in a local SQLite database rather than requiring a hosted account.
- **Your data, your choice:** Optional cloud synchronization will let users choose supported providers.
- **Simple by design:** Managing everyday finances should be intuitive, without requiring training or complicated financial terminology.
- **No arbitrary account limits:** Create as many accounts as you need.
- **Privacy matters:** Financial information should remain under the user's control.

## Planned Features

CentiCopia is under development. The following describes the intended direction of the project; not every feature is necessarily available yet.

### Account Management

Manage all your financial accounts in one application, including:

- Checking and savings accounts
- Credit cards
- Debit cards
- Gift cards and prepaid cards
- Lines of credit
- Loans and other liabilities
- Cash accounts
- Other custom financial accounts

There will be no arbitrary limit on the number of accounts you can create.

### Simple Financial Tracking

The goal is to make everyday financial management straightforward:

- View account balances in one place.
- Record income, expenses, payments, and transfers.
- Review transaction histories.
- Organize transactions into useful categories.
- Track balances across different types of accounts.
- Quickly find the information you need.

### Local Data Storage

CentiCopia is designed to use **SQLite** as its primary data store.

This approach is intended to provide:

- Local access to your financial information.
- A database format that is portable and widely supported.
- No mandatory cloud account or hosted financial-data service.
- Greater control over your data and how it is backed up.

### Optional Cloud Synchronization

Cloud synchronization is intended to be optional, not a requirement for using the application.

Planned integration possibilities include:

- Dropbox
- Google Drive
- Additional providers as the project develops

The goal is to let users choose a provider that fits their needs while retaining local data storage.

Cloud synchronization is a planned capability, and supported providers and synchronization behavior will be documented as they are implemented. In particular, safe conflict resolution and protection against accidental data loss will be important design considerations.

## Privacy and Security

CentiCopia is being designed with local data ownership as a core principle.

- Financial data should not require a third-party hosted service to use the application.
- Cloud synchronization should be optional.
- Users should know where their data is stored and how it is synchronized.
- Backups and synchronization should be designed to reduce the risk of data loss.

Local storage alone does not guarantee security. Users should protect their devices and any copies of their database, and cloud providers will have their own security and privacy policies. Security features and limitations will be documented as the application develops.

## Project Status

**Early development**

CentiCopia is being developed toward its goal of providing a straightforward, local-first personal finance manager.

Features listed as planned should not be considered implemented or production-ready unless the repository's code and documentation confirm their availability.

As development progresses, this README will be updated with the current feature set, setup instructions, supported platforms, and release information.

## Getting Started

Installation and usage instructions will be added once the initial application structure and development workflow are established.

In the meantime, you can explore the source code, follow development, and contribute ideas through the project repository.

**Repository:** [github.com/CentiCopia/CentiCopia](https://github.com/CentiCopia/CentiCopia)

## Contributing

Contributions, suggestions, bug reports, and constructive feedback are welcome.

You can help by:

- Reporting bugs and usability problems.
- Suggesting features that make personal finance management simpler.
- Improving documentation.
- Contributing code and tests.
- Reviewing proposed changes.

Before submitting a substantial change, consider opening an issue to discuss the idea and its fit with the project's goals.

Contribution guidelines and development instructions will be added as the project structure takes shape.

## Donations

CentiCopia is intended to remain free to use forever.

If you find the project useful, voluntary donations can help support continued development, maintenance, and improvements. Donations will never be a requirement to use the application or its core features.

Donation links will be published here if and when they are established.

## License

CentiCopia is intended to be an open-source project. The repository's `LICENSE` file will define the applicable license and the permissions it grants.

Please refer to that file for the definitive licensing terms.

---

**CentiCopia — Every account. One place. Your data.**
