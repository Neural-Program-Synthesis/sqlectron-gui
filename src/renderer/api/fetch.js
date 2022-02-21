const fetch = require('node-fetch');

// const parseReadableStreamToJson = async error => {
//   const data = (await error.getReader().read()).value
//   const str = new TextDecoder('utf-8').decode(data)
//   return JSON.parse(str)
// }

export default class Fetcher {
  static defaultConfigs = {
    mode: 'cors',
    cache: 'default',
  };

  constructor(baseURL, withToken, contentType = 'application/json') {
    this.baseURL = baseURL;
    this.withToken = withToken;
    this.contentType = contentType;
  }

  getURL(url) {
    return `${this.baseURL}${url}`;
  }

  getDefaultHeaders() {
    if (this.contentType === 'multipart/form-data') {
      // If adding multipart/form-data into Content-Type would got error parsing body,
      // therefore I just remove it. Source: https://muffinman.io/blog/uploading-files-using-fetch-multipart-form-data/
      return {
        Accept: 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
      };
    }
    return {
      Accept: 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Content-Type': this.contentType,
      'Access-Control-Allow-Headers': '*',
    };
  }

  // getHeaders () {
  //   if (this.withToken) {
  //     const token = readIdToken()
  //     if (!token.isExpired) {
  //       return {
  //         ...this.getDefaultHeaders(),
  //         Authorization: 'Bearer ' + token.access_token
  //       }
  //     }
  //   }
  //   return this.getDefaultHeaders()
  // }

  async handleResponse(res) {
    const { status, ok } = res;
    let data;
    if (ok) {
      try {
        const resText = await res.text();
        data = resText;
      } catch (ignored) {
        data = {};
      }
    } else {
      // data = await parseReadableStreamToJson(res.body)
      // console.error('error:', data)
    }

    if (!ok || status >= 400) {
      const err = new Error();
      err.data = data;
      err.status = status;
      throw err;
    }

    return {
      data,
      status,
    };
  }

  getConfigs(method, data) {
    const obj = data;
    const configs = {
      ...Fetcher.defaultConfigs,
      method,
      headers: this.getDefaultHeaders(),
    };
    if (method === 'POST' || method === 'PUT') {
      if (this.contentType === 'application/json') {
        const str = {};
        for (const key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            str[key] = obj[key];
          }
        }
        configs.body = JSON.stringify(str);
      } else if (this.contentType === 'multipart/form-data') {
        const formData = new FormData();
        formData.append('upload_file', obj, obj.name);
        configs.body = formData;
      } else {
        const str = [];
        for (const key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            str.push(encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]));
          }
        }
        configs.body = str.join('&');
      }
    }
    return configs;
  }

  async get(url) {
    const res = await fetch(this.getURL(url), this.getConfigs('GET'));
    return this.handleResponse(res);
  }

  async post(url, data) {
    const res = await fetch(this.getURL(url), this.getConfigs('POST', data));
    return this.handleResponse(res);
  }

  async put(url, data) {
    const res = await fetch(this.getURL(url), this.getConfigs('PUT', data));
    return this.handleResponse(res);
  }

  async delete(url, data) {
    const res = await fetch(this.getURL(url), this.getConfigs('DELETE', data || {}));
    return this.handleResponse(res);
  }
}
