const { createClient } = require("@astrajs/collections");

export default async function handler(req, res) {
  const astraClient = await createClient({
    astraDatabaseId: process.env.ASTRA_DB_ID,
    astraDatabaseRegion: process.env.ASTRA_DB_REGION,
    applicationToken: process.env.ASTRA_DB_APPLICATION_TOKEN,
  });

  const membersCollection = astraClient
    .namespace("nextjs")
    .collection("members");

  if (req.method === "POST") {
    const { body } = req;
    const member = {
      name: body.name,
      location: body.location,
      github: body.github,
    };

    const newMember = await membersCollection.create(member);
    res.status(201).json({ id: newMember.documentId, ...member });

    return;
  }

  let members = [];
  if (req.query.keyword) {
    members = await membersCollection.find({
      name: { $eq: req.query.keyword },
    });
  } else {
    members = await membersCollection.find({});
  }

  res
    .status(200)
    .json(Object.keys(members).map((key) => ({ id: key, ...members[key] })));
}
