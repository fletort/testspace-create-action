# Create a TestSpace Project

This action creates a TestSpace project linked to a GitHub Repository.

# Prerequisite

You need to create a domain on [Testspace.com](https://testspace.com/).

Your purpose is to publising your test results from automation to Testspace.com.

This is possible by using [the Testspace.com Application from GitHub marketplace](https://github.com/marketplace/testspace-com)
and [the Testspace Setup CLI Action](https://github.com/marketplace/actions/testspace-setup-cli).

Unfortunately, this integration does not create the project
on Testspace side that is linked to your GitHub repository.

This action resolves this lack. It can be play in your job workflow before the Testspace Setup CLI Action, or only at the creation of your GitHub
repository (in a dynamic template procedure for example).

# Usage
<!-- start usage -->
```yaml
- uses: fletort/testspace-create-action@v1
  with:

    # Personal testspace token used to interact with the testspace API to create the project
    # Required
    token: ''

    # TestSpace User Domain
    # Default: ${{ github.repository_owner }}
    domain: ''

    # Repository name with owner. For example, fletort/testspace-create-action
    # Default: ${{ github.repository }}
    repository: ''
```
<!-- end usage -->

# Scenarios

## Create for the local repository

```yaml
- uses: fletort/testspace-create-action@v1
  with:
    token: ${{ secrets.TESTSPACE_TOKEN }}
```

## Create for another repository

```yaml
- uses: fletort/testspace-create-action@v1
  with:
    token: ${{ secrets.TESTSPACE_TOKEN_FOR_THE_ORG }}
    repository: "the_org/my_targeted_repo"
    domain: "the_org"
```

# License

The scripts and documentation in this project are released under the [MIT License](LICENSE)