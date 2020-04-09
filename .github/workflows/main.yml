workflow "Blah" {
  on = "push"
  resolves = "Build"
}

action = "Build" {
steps:
- uses: actions/checkout@v2
- uses: actions/setup-node@v1
  with:
    node-version: '12.x'
- run: npm install
}