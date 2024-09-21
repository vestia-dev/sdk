<p align="center">
  <a href="https://vestia.dev/">
    <img alt="Vestia" src="https://raw.githubusercontent.com/vestia-dev/sdk/main/logo.png" width="300" />
  </a>
</p>

---

# Vestia

The open-source SDKs for building a Vestia application.

# Releases

To release a new version of packages, run the following command to create a changeset:

```bash
npx changeset
```

Then add, commit and push:

```bash
git add . && git commit -m "Release" && git push
```

Finally, merge the pull request created by the changeset bot to release to NPM. Note: not all changes require a changeset or a new version release.
