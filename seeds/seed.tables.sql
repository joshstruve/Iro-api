BEGIN;

TRUNCATE
  "word",
  "language",
  "sr_user";

INSERT INTO "sr_user" ("id", "username", "name", "password")
VALUES
  (1,'admin','Dunder Mifflin Admin', '$2a$10$fCWkaGbt7ZErxaxclioLteLUgg4Q3Rp09WW0s/wSLxDKYsaGYUpjG');

INSERT INTO "language" ("id", "name", "user_id")
VALUES
  (1, 'Japanese', 1);

INSERT INTO "word" ("id", "language_id", "original", "translation", "next", "hex", "script")
VALUES
  (1, 1, 'Orange', 'Orenji', 2, '#FFB74D', 'orange.svg'),
  (2, 1, 'Yellow', 'Ki-iro', 3, '#FFF07F', 'yellow.svg'),
  (3, 1, 'Blue', 'Ao', 4, '#84B3FD', 'blue.svg'),
  (4, 1, 'Red', 'Aka', 5, '#B51F23', 'red.svg'),
  (5, 1, 'Green', 'Midori', 6, '#6FEFB0', 'green.svg'),
  (6, 1, 'Black', 'Kuro', 7, '#000000', 'black.svg'),
  (7, 1, 'Brown', 'Cha-iro', 8, '#8D6E64', 'brown.svg'),
  (8, 1, 'Pink', 'Pinku', 9, '#FD4482', 'pink.svg'),
  (9, 1, 'Purple', 'Murasaki', 10, '#BA68C8', 'purple.svg'),
  (10, 1, 'White', 'Shiro', 11, '#FFFFFF', 'white.svg'),
  (11, 1, 'Gray', 'Hai-iro', 12, '#BDBDBD', 'gray.svg'),
  (12, 1, 'Lilac', 'Rairakku', null, '#C8A2C8', 'lilac.svg');
  

UPDATE "language" SET head = 1 WHERE id = 1;

-- because we explicitly set the id fields
-- update the sequencer for future automatic id setting
SELECT setval('word_id_seq', (SELECT MAX(id) from "word"));
SELECT setval('language_id_seq', (SELECT MAX(id) from "language"));
SELECT setval('sr_user_id_seq', (SELECT MAX(id) from "sr_user"));

COMMIT;
