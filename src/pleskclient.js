import fetch from "node-fetch";
import generator from "generate-password";
export default class PleskClient {
  constructor(url, basickey, ips, owner_login) {
    this.url = url;
    this.basickey = basickey;
    this.ips = ips;
    if (owner_login) {
      this.owner_login = owner_login;
    } else {
      this.owner_login = "admin";
    }
    if (!url || !basickey || !ips) throw "Please enter url and basic key";
  }

  call(path, method, body) {
    let promise = new Promise((resolve, reject) => {
      let options = {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Basic ${this.basickey}`,
        },
        method: method,
      };

      if (body) options.body = JSON.stringify(body);
      fetch(`https://${this.url}/api/v2/${path}/`, options)
        .then((res) => res.json())
        .then((res) => resolve(res))
        .catch((err) => reject(err));
    });
    return promise;
  }

  setIPs(newIPs) {
    this.ips = newIPs;
  }

  setURL(newURL) {
    this.url = newURL;
  }

  setKey(newKey) {
    this.basickey = newKey;
  }

  domains() {
    return this.call("domains", "GET");
  }

  clients() {
    return this.call("clients", "GET");
  }

  getClientDetails(id) {
    return this.call(`clients/${id}`, "GET");
  }

  deleteClient(id) {
    return this.call(`clients/${id}`, "DELETE");
  }

  getClientDomains(id) {
    return this.call(`clients/${id}/domains`, "GET");
  }

  getClientStats(id) {
    return this.call(`clients/${id}/statistics`, "GET");
  }

  getServerInfo() {
    return this.call("server", "GET");
  }

  getIPs() {
    return this.call("server/ips", "GET");
  }

  suspendClient(id) {
    return this.call(`clients/${id}/suspend`, "PUT");
  }

  activateClient(id) {
    return this.call(`clients/${id}/activate`, "PUT");
  }

  createClient(details) {
    return this.call(`clients`, "POST", details);
  }

  createDomain(details) {
    return this.call(`domains`, "POST", details);
  }

  async createCustomerWithDomain(domain, client, plan) {
    let username = client.name.toLocaleLowerCase().split(" ").join("").trim();
    var external_id = generator.generate({
      length: 32,
      numbers: true,
      symbols: false,
      lowercase: true,
      uppercase: false,
    });
    var password = generator.generate({
      length: 32,
      numbers: true,
      symbols: false,
      lowercase: true,
      uppercase: true,
    });
    let clientData = {
      name: client.name,
      company: "",
      login: username,
      status: 0,
      email: client.email,
      locale: "en-US",
      owner_login: "admin",
      external_id: external_id,
      description: "",
      password: password,
      type: "customer",
    };

    let createdCustomer = await this.createClient(clientData);
    let domainData = {
      name: domain,
      description: "",
      hosting_type: "virtual",
      hosting_settings: {
        ftp_login: username,
        ftp_password: password,
      },
      owner_client: {
        id: createdCustomer.id,
        login: username,
        guid: createdCustomer.guid,
        external_id: "",
      },
      ip_addresses: this.ips,
      ipv4: this.ips,
      plan: {
        name: plan,
      },
    };
    let createdDomain = await this.createDomain(domainData);
    return {
      createdCustomer,
      createdDomain,
      user: {
        password,
        username,
      },
    };
  }

  async createDomainForExistingCustomer(domain, client, plan) {
    let clients = await this.clients();
    var pleskClient = clients.find((x) => x.email == client.email);
    var password = generator.generate({
      length: 32,
      numbers: true,
      symbols: false,
      lowercase: true,
      uppercase: true,
    });
    var ftplogin = generator.generate({
      length: 16,
      numbers: false,
      symbols: false,
      lowercase: true,
      uppercase: false,
    });
    let domainData = {
      name: domain,
      description: "",
      hosting_type: "virtual",
      hosting_settings: {
        ftp_login: ftplogin,
        ftp_password: password,
      },
      owner_client: {
        id: pleskClient.id,
        login: pleskClient.name,
        guid: pleskClient.guid,
        external_id: "",
      },
      ip_addresses: this.ips,
      ipv4: this.ips,
      plan: {
        name: plan,
      },
    };
    var nDomain = await this.createDomain(domainData);
    return { nDomain, ftp: { login: ftplogin, password } };
  }
}
