curl -L https://unpkg.com/unicode-emoji-json/data-by-group.json | jq -c 'to_entries | .[].value | map({ value: .emoji, name: .name })' | split -l 1 -d - ./src/emoji/
curl -L https://unpkg.com/unicode-emoji-json/data-by-group.json | jq 'to_entries | map(.key)'

# then rename "00" -> "xxx.json" ...
