import express from "express";
import morgan from "morgan";

import "reflect-metadata";
import { createConnection } from "typeorm";
import { Patches } from "./entity/Patches";

import Config from "../config";
import { SynthConfig } from "../@types";

const PORT = process.env.PORT || 3000;

createConnection()
  .then(async connection => {
    const patchRepository = connection.getRepository(Patches);

    // Create a new express app instance
    const app: express.Application = express();

    app.use(express.static("dist"));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(morgan("common"));

    app.get("/api/patches", async (req, res) => {
      const page: number = Number(req.query.page) || 0;
      const limit: number = Number(req.query.limit) || 10;

      const synth: string = String(req.query.synth);
      const synthConfig: SynthConfig = Config.synths[synth];

      if (synth && !synthConfig) {
        return res
          .status(400)
          .json({ error: `Bad Request: synth '${synth}' is unknown` });
      }

      let qb = patchRepository
        .createQueryBuilder("patches")
        .where("patches.name ilike :name", { name: "%" + req.query.qs + "%" })
        .orWhere("patches.author ilike :author", {
          author: "%" + req.query.qs + "%"
        });

      if (synthConfig) {
        qb = qb.andWhere("patches.synth = :synth", { synth: synth });
      }

      const patches = await qb
        .skip((page - 1) * limit)
        .take(limit)
        .getMany();

      const count: number = await qb.getCount();

      const result = {
        patches: patches,
        total: Math.floor(count / limit)
      };

      return res.json(result);
    });

    app.get("/api/sysex", async (req, res) => {
      let ids = req.query.ids as Array<string>;

      const synth: string = String(req.query.synth);
      const synthConfig: SynthConfig = Config.synths[synth];

      if (!synthConfig) {
        return res
          .status(400)
          .json({ error: `Bad Request: synth '${synth}' is unknown` });
      }

      if (!ids || ids.length !== synthConfig.numVoices) {
        return res.status(400).json({
          error: `Bad Request: ${synth} requires ${synthConfig.numVoices} patches`
        });
      }

      if (typeof ids === "string") {
        ids = [ids];
      } else if (typeof ids !== "object") {
        return res.status(400).send("Bad Request: invalid parameter(s) 'ids'");
      }

      let patches = await patchRepository.findByIds(ids);
      patches.sort((a, b) => {
        return ids.indexOf(a.id.toString(10)) - ids.indexOf(b.id.toString(10));
      });

      res.set({
        "Content-Type": "application/octet-stream",
        "Content-Disposition": "attachment;"
      });

      // TODO: customize this to support different synth sysex formats
      const header = Buffer.from("F04300092000", "hex"); // 32 voices

      // Calculate checksum and insert into sysex
      let buf = Buffer.concat(patches.map(patch => patch.data));
      const sum = buf.reduce((accu, curr) => {
        return accu + curr;
      });
      const checksum = ((128 - sum) & 127) % 128;

      const footer = Buffer.from(checksum.toString(16) + "F7", "hex");

      buf = Buffer.concat([header, buf, footer]);

      return res.send(buf);
    });

    app.get("/api/random", async (req, res) => {
      const synth: string = String(req.query.synth);
      const synthConfig: SynthConfig = Config.synths[synth];

      if (!synthConfig) {
        return res
          .status(400)
          .json({ error: `Bad Request: synth '${synth}' is unknown` });
      }

      const numVoices = Number(req.query.n) || synthConfig.numVoices;

      let qb = patchRepository.createQueryBuilder("patches");

      const count: number = await qb.getCount();

      let ids = [];
      let patches: Patches[] = [];

      // in the very rare case that this returns duplicates...
      while (patches.length !== numVoices) {
        for (let i = 0; i < numVoices; i++) {
          let n = Math.random() * count;
          n = Math.floor(n);
          ids.push(n.toString(10));
        }
        patches = await patchRepository.findByIds(ids);
      }

      const result = {
        patches: patches,
        total: patches.length
      };

      return res.json(result);
    });

    // health endpoint, required for ingress
    app.get("/api/health", async (req, res) => {
      return res.status(200).json({ status: "OK" });
    });

    app.listen(PORT, function() {
      console.log(`Server is listening on port ${PORT}`);
    });
  })
  .catch(error => console.log(error));
