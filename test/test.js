//During the test the env variable is set to test
process.env.NODE_ENV = "development";

//Require the dev-dependencies
const fs = require("fs");
const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../index");
const should = chai.should();

chai.use(chaiHttp);

const kongensfald = fs.readFileSync("./data/kongensfald.txt", "utf8");
const weekendavisen = fs.readFileSync("./data/weekendavisen.txt", "utf8");

//Our parent block
describe("Tests", () => {
  /*
   * Test the /GET route
   */
  describe("/POST Longwords", () => {
    it("It should POST txt and receive analysis on Long Words", (done) => {
      chai
        .request(server)
        .post("/api/longwords")
        .send({ input: kongensfald, options: { minLength: 6 } })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("object");
          res.body.should.have.property("returnText");
          done();
        });
    });
  });
});
