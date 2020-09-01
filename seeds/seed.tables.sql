BEGIN;

TRUNCATE
  "word",
  "language",
  "user";

INSERT INTO "user" ("id", "username", "name", "password")
VALUES
  (
    1,
    'admin',
    'Dunder Mifflin Admin',
    -- password = "pass"
    '$2a$10$fCWkaGbt7ZErxaxclioLteLUgg4Q3Rp09WW0s/wSLxDKYsaGYUpjG'
  );

INSERT INTO "language" ("id", "name", "user_id")
VALUES
  (1, 'Japanese', 1);

INSERT INTO "word" ("id", "language_id", "original", "translation", "next", "hex", "script")
VALUES
  (1, 1, 'Oranji', 'orange', 2, '#FFB74D', 'オレンジ'),
  (2, 1, 'Ki-iro', 'yellow', 3, '#FFF07F', 'きいろ'),
  (3, 1, 'Ao', 'blue', 4, '#84B3FD', 'あお'),
  (4, 1, 'Aka', 'red', 5, '#B51F23', 'あか'),
  (5, 1, 'Midori', 'green', 6, '#6FEFB0', 'みどり'),
  (6, 1, 'Kuro', 'black', 7, '#000000', 'くろ'),
  (7, 1, 'Cha-iro', 'brown', 8, '#8D6E64', 'ちゃいろ'),
  (8, 1, 'Pinku', 'pink', 9, '#FD4482', 'ピンク'),
  (9, 1, 'Murasaki', 'purple', 10, '#BA68C8', 'むらさき'),
  (10, 1, 'Shiro', 'white', 11, '#FFFFFF', 'しろ'),
  (11, 1, 'Hai-iro', 'gray', 12, '#BDBDBD', 'はいいろ');
  (12, 1, 'Rairakku', 'lilac', null, '#C8A2C8', 'ライラック');
  

UPDATE "language" SET head = 1 WHERE id = 1;

-- because we explicitly set the id fields
-- update the sequencer for future automatic id setting
SELECT setval('word_id_seq', (SELECT MAX(id) from "word"));
SELECT setval('language_id_seq', (SELECT MAX(id) from "language"));
SELECT setval('user_id_seq', (SELECT MAX(id) from "user"));

COMMIT;
