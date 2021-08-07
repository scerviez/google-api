const cheerio = require("cheerio");
const axios = require("axios");
const express = require("express")
const app = express();
const PORT = 8000;

const AXIOS_OPTIONS = {
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.157 Safari/537.36",
  },
};

function cari(kata) {
  return axios
    .get(
      `https://www.google.com/search?q=${kata}&hl=id&gl=id`,
      AXIOS_OPTIONS
    )
    .then(function ({ data }) {
      let $ = cheerio.load(data);

      const links = [];
      const titles = [];
      const snippets = [];

      $(".yuRUbf > a").each((i, el) => {
        links[i] = $(el).attr("href");
      });
      $(".yuRUbf > a > h3").each((i, el) => {
        titles[i] = $(el).text();
      });
      $(".IsZvec").each((i, el) => {
        snippets[i] = $(el).text().trim();
      });

      return {
				'success': true,
				'titles': titles,
				'links': links,
				'snippets': snippets
      }
    })
  }

loghandler = {
    start: {
        status: true,
        creator: '@nekozu',
        code: 200,
        message: 'Selamat datang di google search api. /search?q=pencarian'
    }
}


app.get("/", (req, res) => {
    res.json(loghandler.start)
})


app.get("/search", (req, res) => {
    const q = req.query.q
    res.setHeader("Cache-Control", "public,max-age=3600,s-maxage=30");
    setImmediate(() => {
      try {
        if(q == '' || q == null){
          res.status(400).send({
            code: res.statusCode,
            success: false,
            message: "Soal Silahkan Diisi",
            creator: "kurayantod"
          });
        }else{
          cari(q)
            .then((data) => {
              const judul = data.titles[0]
              const url = data.links[0]
              const deskripsi = data.snippets[0]
              res.json({
                 status: true,
                 title: judul,
                 link: url,
                 desk: deskripsi
             })
          })
            .catch((err) => console.log(err));
        }
      } catch (e) {
        res.status(400).send("Mungkin ada yang error");
      }
    });
});

app.listen(PORT, () => {
    console.log("Server running on port " + PORT)
})
