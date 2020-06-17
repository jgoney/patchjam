import os
import sys

import psycopg2


def split_sysex_str(s):
    limit = bytes.fromhex("F7")
    parts = s.split(limit)

    for i, p in enumerate(parts):
        p += limit

        f_name = "part_{}.syx".format(i + 1,)
        print(f_name)

        with open(f_name, "wb") as f_out:
            f_out.write(p)


def parse_sysex_voices(f_name):
    voices = []

    with open(f_name, "rb") as f:
        sysex = f.read()
        check_byte = sysex[-2:-1].hex()

        # distinguishes where the voice data starts in sysex
        header = bytes.fromhex("F0 43 00 09 20 00")
        f.seek(0)

        index = sysex.index(header)

        offset = len(header) + index
        f.seek(offset)  # seek to beginning of voice data

        byte_sum = sum(f.read(4096))
        checksum = ((128 - byte_sum) & 127) % 128
        checksum = "{0:02x}".format(
            checksum
        )  # convert checksum to 0-padded hex string for comparison

        if checksum != check_byte:
            with open("checksum_errors.txt", "a") as errors:
                # log checksum error, but continue since the voices may still work anyway
                errors.write(f_name + "\n")

        f.seek(offset)

        try:
            while f:
                voice = f.read(128)

                # Check last byte for f7 ("end of sysex" byte)
                if voice[1:2].hex() == "f7":
                    break

                name = voice[-10:]
                name = name.decode("utf-8", "strict")
                name = name.replace("\x00", "")
                print(name)

                d = {
                    "name": name,
                    "voice_data": voice[:-10],
                    "full_voice": voice,
                    "original_sysex": os.path.basename(f_name),
                }
                yield (d)

        except ValueError:
            raise


def walk_and_parse(path):
    print("Walking {}".format(path))
    unique = set([])
    voices = []
    total = 0
    author = ""

    for root, dirs, files in os.walk(path):
        print("########")
        print(root, dirs, files)
        print("########")

        if "!author.txt" in files:
            with open(os.path.join(root, "!author.txt"), "r") as author_file:
                temp_author = author_file.read().strip()
                if temp_author:
                    author = temp_author
                else:
                    author = os.path.basename(root)

                print("author:", author)

        for fn in files:
            if fn.lower().endswith("syx"):
                try:
                    for v in parse_sysex_voices(os.path.join(root, fn)):
                        total += 1
                        if v["voice_data"] not in unique:
                            unique.add(v["voice_data"])
                            v["author"] = author
                            voices.append(v)

                except ValueError as e:
                    print(e)
                    with open("errors.txt", "a") as errors:
                        errors.write(os.path.join(root, fn) + "\n")

    print(len(voices))
    print(len(unique))
    print(total)
    return voices


if __name__ == "__main__":

    patch_path = os.getenv("PATCH_PATH")
    if not patch_path:
        print("PATCH_PATH invalid, exiting...")
        sys.exit(1)

    print(patch_path)

    conn = psycopg2.connect(
        database=os.getenv("POSTGRES_DB"),
        user=os.getenv("POSTGRES_USER"),
        password=os.getenv("POSTGRES_PASSWORD"),
        host="127.0.0.1",
        port="5432",
    )

    cur = conn.cursor()
    cur.execute("DROP TABLE IF EXISTS patches;")
    cur.execute("DROP TABLE IF EXISTS patches_favorites;")

    cur.execute(
        """
    CREATE TABLE IF NOT EXISTS patches
        (id serial PRIMARY KEY NOT NULL,
        name varchar NOT NULL,
        author varchar,
        original_sysex varchar,
        synth varchar,
        data BYTEA NOT NULL);
        """
    )

    conn.commit()

    voices = walk_and_parse(patch_path)

    print("Inserting {} voices...".format(len(voices)),)
    for v in voices:
        cur.execute(
            "INSERT INTO patches (name, author, original_sysex, synth, data) VALUES (%s, %s, %s, %s, %s)",
            (v["name"], v["author"], v["original_sysex"], "DX7", v["full_voice"]),
        )

    conn.commit()
    conn.close()
