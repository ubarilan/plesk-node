# plesk-node

A simpler way to use the Plesk REST api

## Authors:

[ubarilan](https://www.github.com/ubarilan), [idandev](https://www.github.com/idandev)

**How to install:**

```bash
npm install plesk-node
```

**Github repository:**
[github.com/ubarilan/plesk-node](https://github.com/ubarilan/plesk-node)

**Example of usage:**

```js
import PleskClient from "plesk-node";
// You can also use: const PleskClient = require("plesk-node")

const plesk = new PleskClient(
  "hostname:8443", // hostname + port of Plesk panel.
  "apikey/base64 of username:password", // https://www.base64decode.org/ you can use this website to create your base64 api key.
  ["1.1.1.1"], // IPs list
  "admin" // Default owner of all accounts created by this module.
);

plesk.getIPs().then((ips) => console.log(ips));
```

&copy; Hostar 2021.
