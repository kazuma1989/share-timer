json=$(curl -L https://unpkg.com/unicode-emoji-json/data-by-group.json)

mkdir -p ./src/emoji/

echo "$json" | jq -r 'to_entries | map(.key) | .[]' | while read key; do
  query='.["'$key'"] | map({ value: .emoji, name: .name })'

  echo "$json" | jq "$query" > ./src/emoji/"$key".json
done
