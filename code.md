Upload file

```javascript
import axios from 'axios';
import * as FormData  from 'form-data'

async function sendData(jsonData){
    // const payload = JSON.stringify({ hello: 'world'});
    const payload = JSON.stringify(jsonData);
    const bufferObject = Buffer.from(payload, 'utf-8');
    const file = new FormData();

    file.append('upload_file', bufferObject, "b.json");

    const response = await axios.post(
        lovelyURL,
        file,
        headers: file.getHeaders()
    ).toPromise();


    console.log(response?.data);
}
```

21

Sharing my experience with React & HTML input

Define input field

```html
<input type="file" onChange="{onChange}" accept="image/*" />
```

Define onChange listener

```javascript
const onChange = (e) => {
  let url = 'https://<server-url>/api/upload';
  let file = e.target.files[0];
  uploadFile(url, file);
};

const uploadFile = (url, file) => {
  let formData = new FormData();
  formData.append('file', file);
  axios
    .post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    .then((response) => {
      fnSuccess(response);
    })
    .catch((error) => {
      fnFail(error);
    });
};
const fnSuccess = (response) => {
  //Add success handling
};

const fnFail = (error) => {
  //Add failed handling
};
```
