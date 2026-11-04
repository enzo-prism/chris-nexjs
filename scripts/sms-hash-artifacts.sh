#!/usr/bin/env bash
# Print sha256sum of SMS visibility proof files. Do not edit the output by hand.
set -euo pipefail
dir=${1:-test-results/sms-visibility}
if [ ! -d "$dir" ]; then
  echo "sms-hash-artifacts: missing directory $dir" >&2
  exit 1
fi
cd "$dir"
mapfile -t files < <(find . -maxdepth 1 -type f \( -name 'sms-*.png' -o -name 'sms-*.txt' \) ! -name 'artifact-hashes.txt' -printf '%f\n' | LC_ALL=C sort)
if [ "${#files[@]}" -eq 0 ]; then
  echo "sms-hash-artifacts: no sms-*.png or sms-*.txt files in $dir" >&2
  exit 1
fi
sha256sum -- "${files[@]}"
