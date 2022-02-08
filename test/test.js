//During the test the env variable is set to test
process.env.NODE_ENV = "development";

//Require the dev-dependencies
const fs = require("fs");
const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../index");
const should = chai.should();

chai.use(chaiHttp);

const sampleOptions = {};
const example = JSON.stringify(fs.readFileSync("./data/example.json", "utf8"));
const kongensfald = fs.readFileSync("./data/kongensfald.txt", "utf8");
const weekendavisen = fs.readFileSync("./data/weekendavisen.txt", "utf8");

//Our parent block
describe("Tests", () => {
  // Correct-text
  describe("/POST Correct-text", () => {
    it("It should return a 200 response", (done) => {
      chai
        .request(app)
        .post("/api/correct-text")
        .send({ input: example, options: sampleOptions })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("object");
          res.body.should.have.property("editor");
          res.body.should.have.property("sidebar");
          done();
        });
    });
  });

  // Evaluate Vocab
  describe("/POST evaluate-vocab", () => {
    it("It should return a 200 response", (done) => {
      chai
        .request(app)
        .post("/api/evaluate-vocab")
        .send({ input: example, options: sampleOptions })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("object");
          res.body.should.have.property("editor");
          res.body.should.have.property("sidebar");
          done();
        });
    });
  });

  // Evaluate Vocab
  describe("/POST text-metrics", () => {
    it("It should return a 200 response", (done) => {
      chai
        .request(app)
        .post("/api/text-metrics")
        .send({ input: example, options: sampleOptions })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("object");
          res.body.should.have.property("sidebar");
          done();
        });
    });
  });

  // Longwords
  describe("/POST Longwords", () => {
    it("It should return a 200 response", (done) => {
      chai
        .request(app)
        .post("/api/longwords")
        .send({ input: example, options: sampleOptions })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("object");
          res.body.should.have.property("editor");
          res.body.should.have.property("sidebar");
          done();
        });
    });
  });

  // Sentence rhythm
  describe("/POST Sentence rhythm", () => {
    it("It should return a 200 response", (done) => {
      chai
        .request(app)
        .post("/api/sentence-rhythm")
        .send({ input: example, options: sampleOptions })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("object");
          res.body.should.have.property("editor");
          res.body.should.have.property("sidebar");
          done();
        });
    });
  });

  // Rate sentiment
  describe("/POST Rate sentiment", () => {
    it("It should return a 200 response", (done) => {
      chai
        .request(app)
        .post("/api/rate-sentiment")
        .send({ input: example, options: sampleOptions })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("object");
          res.body.should.have.property("editor");
          res.body.should.have.property("sidebar");
          done();
        });
    });
  });

  // Sentence difficulty
  describe("/POST Sentence difficulty", () => {
    it("It should return a 200 response", (done) => {
      chai
        .request(app)
        .post("/api/sentence-difficulty")
        .send({ input: example, options: sampleOptions })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("object");
          res.body.should.have.property("editor");
          res.body.should.have.property("sidebar");
          done();
        });
    });
  });

  // Correct text but for KONGENS FALD
  describe("/POST Overload", () => {
    it("It should return a 200 response", (done) => {
      chai
        .request(app)
        .post("/api/correct-text")
        .send({ input: kongensfald, options: sampleOptions })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("object");
          res.body.should.have.property("editor");
          res.body.should.have.property("sidebar");
          done();
        });
    });
  });
});
