const DOMAIN = <PASTE YOUR DOMAIN JSON OBJECT HERE>
    const { createAvatar } = require('@dicebear/avatars');
    const style = require('@dicebear/open-peeps');
    const Nuron = require('nuronjs')
    const nuron = new Nuron({
    key: "m'/44'/60'/0'/0/0",
    workspace: "open-peeps",
    domain: DOMAIN
});
    (async () => {

    ////////////////////////////////////////////////////
    //
    // 0. CLEAN UP WORKSPACE (OPTIONAL)
    // if you want to start from clean slate
    // every time you run this code, remove everything
    // from the file system and the DB first.
    //
    ////////////////////////////////////////////////////

    // 0.1. Remove all files from the workspace "fs" folder
    await nuron.fs.rm("*")

    // 0.2. Remove all items from the token table
    await nuron.db.rm("token", {})

    // Loop 42 times and make avatars
    for(let i=0; i<42; i++) {

    ////////////////////////////////////////////////////
    //
    // 1. CREATE FILES (SVG + METADATA)
    //
    ////////////////////////////////////////////////////

    // 1.1. Generate the Avatar SVG
    let svg = createAvatar(style, { seed: i.toString() });

    // 1.2. Write the SVG to the file system
    let svg_cid = await nuron.fs.write(Buffer.from(svg))

    // 1.3. Write the NFT metadata to the file system
    let metadata_cid = await nuron.fs.write({
    name: `${i}`,
    description: `${i}.svg`,
    image: `ipfs://${svg_cid}`,
    mime: { [svg_cid]: "image/svg+xml" }  // to render the SVG with the correct mime type in the frontend
})

    ////////////////////////////////////////////////////
    //
    // 2. CREATE A TOKEN AND WRITE TO NURON
    //
    ////////////////////////////////////////////////////

    // 2.1. Create a token from the metadata cid
    let token = await nuron.token.create({
    cid: metadata_cid
})

    // 2.2. Write the token to the DB ("token" table)
    await nuron.db.write("token", token)

    // 2.3. Write the token to the file system
    await nuron.fs.write(token)

    ////////////////////////////////////////////////////
    //
    // 3. PIN ALL THE FILES (SVG + METADATA)
    //
    ////////////////////////////////////////////////////

    await nuron.fs.pin(svg_cid)
    await nuron.fs.pin(metadata_cid)

    console.log(`[${i}] created token`, token)
}

    ////////////////////////////////////////////////////////////////
    //
    // 4. BUILD A BASIC COLLECTION WEBSITE (index.html + token.html)
    //
    ////////////////////////////////////////////////////////////////
    await nuron.web.build()
    console.log("finished")
})();