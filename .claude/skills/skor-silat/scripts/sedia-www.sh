#!/usr/bin/env bash
# Salin ketua/juri/tv/index ke folder www/ dengan DB_URL ditukar ke Firebase tiruan.
# Guna: bash sedia-www.sh <repo-skor-silat> <folder-www> [satu-hos]
#   satu-hos = "ya"  -> semua skrin guna 127.0.0.1:8771 (meniru keadaan sebenar: semua skrin ke satu hos)
#   (kosong)         -> Ketua:8780, TV:8781, Juri N:877N (untuk rakaman video banyak iframe)
set -e
REPO="$1"; WWW="$2"; SATU="$3"
U='https://skor-silatolahraga-default-rtdb.asia-southeast1.firebasedatabase.app'
mkdir -p "$WWW"
cp "$REPO/index.html" "$WWW/index.html"
if [ "$SATU" = "ya" ]; then
  for f in ketua juri tv; do sed "s#\"$U\"#\"http://127.0.0.1:8771\"#" "$REPO/$f.html" > "$WWW/$f.html"; done
else
  sed "s#\"$U\"#\"http://localhost:8780\"#" "$REPO/ketua.html" > "$WWW/ketua.html"
  sed "s#\"$U\"#\"http://localhost:8781\"#" "$REPO/tv.html" > "$WWW/tv.html"
  sed "s#\"$U\"#\"http://localhost:\" + (8770 + (parseInt(new URLSearchParams(location.search).get(\"j\"), 10) || 0))#" "$REPO/juri.html" > "$WWW/juri.html"
fi
for f in ketua juri tv; do
  grep -q "firebasedatabase.app" "$WWW/$f.html" && { echo "RALAT: DB_URL tidak ditukar dalam $f.html"; exit 1; }
done
echo "www sedia di $WWW"
