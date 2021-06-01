const fetch = require("node-fetch");

module.exports = {
  name: "spotify",
  firstEndpoints: ["/artist/:name", "/track/:name", "/album/:name"],
  secondEndpoints: ["ARTIST: /:name", "TRACK: /:name", "ALBUM: /:name"],
  async run(par, other) {
    if (par === "artist") {
      const data = await search("artist", other);
      if (!data) return { error: "Artist not found!" };

      return {
        id: data.id,
        name: data.name,
        uri: data.uri,
        url: data.external_urls.spotify,
        followers: data.followers.total,
        popularity: data.popularity,
        images: data.images,
      }
    }
    if (par === "track") {
      const data = await search(par, other);
      if (!data) return { error: "Track not found!" };

      let artists = [[], []]
      data.artists.forEach(artist => {
        artists[0].push({
          id: artist.id,
          name: artist.name,
          uri: artist.uri,
          url: artist.external_urls.spotify
        })
      })
      data.album.artists.forEach(artist => {
        artists[1].push({
          id: artist.id,
          name: artist.name,
          uri: artist.uri,
          url: artist.external_urls.spotify
        })
      })

      return {
        id: data.id,
        name: data.name,
        uri: data.uri,
        url: data.external_urls.spotify,
        duration: data.duration_ms,
        preview: data.preview_url,
        popularity: data.popularity,
        artists: artists[0],
        album: {
          id: data.album.id,
          name: data.album.name,
          uri: data.album.uri,
          url: data.album.external_urls.spotify,
          release_date: data.album.release_date,
          images: data.album.images,
          artists: artists[1],
        },
      }
    }
    if (par === "album") {
      const data = await search(par, other);
      if (!data) return { error: "Album not found!" };

      let artists = []
      data.artists.forEach(artist => {
        artists.push({
          id: artist.id,
          name: artist.name,
          uri: artist.uri,
          url: artist.external_urls.spotify
        })
      })

      return {
        id: data.id,
        name: data.name,
        uri: data.uri,
        url: data.external_urls.spotify,
        release_date: data.release_date,
        total_tracks: data.total_tracks,
        images: data.images,
        artists: artists,
      }
    }
  },
};

async function search(type, query) {
  const resp = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=${type}`, {
    "Content-Type": "application/json",
    headers: {
      "Authorization": `Bearer ${process.env.SPOTIFY_TOKEN}`
    }
  }).then(resp => resp.json())

  return resp[type + "s"].items[0]
}