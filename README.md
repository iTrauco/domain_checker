# Domain checker
This Node.js CLI script takes a list of strings in a text file and tests all combinations of pairs, outputting a list of (possibly) unregistered ".com" domains.

Usage: `node domain_check.js strings.txt`

where `strings.txt` is a newline-delimited text file, e.g.

```
foo
bar
baz
goo
gle
face
book
ama
zon
insta
gram
```
