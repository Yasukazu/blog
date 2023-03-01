
// https://blog.bagooon.com/?p=1888
// default thumbnail when fails
const imgIcon = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPHN2ZyB2aWV3Qm94PSIwIDAgMjQxLjM2IDEyMy43NDYiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPHRleHQgc3R5bGU9IndoaXRlLXNwYWNlOiBwcmU7IGZpbGw6IHJnYig1MSwgNTEsIDUxKTsgZm9udC1mYW1pbHk6IEFyaWFsLCBzYW5zLXNlcmlmOyBmb250LXNpemU6IDE5LjVweDsiIHg9IjQ0LjMxNCIgeT0iNDkuMzMxIj5GYWlsZWQgdG8gZ2VuZXJhdGU8L3RleHQ+CiAgPHRleHQgc3R5bGU9IndoaXRlLXNwYWNlOiBwcmU7IGZpbGw6IHJnYig1MSwgNTEsIDUxKTsgZm9udC1mYW1pbHk6IEFyaWFsLCBzYW5zLXNlcmlmOyBmb250LXNpemU6IDE5LjVweDsiIHg9IjU3LjY5MiIgeT0iOTAuNTgiPlRodW1ibmFpbDwvdGV4dD4KPC9zdmc+';

/**
 * Make a thumbnail from an image file
 * @param {HTMLImageElement} file 
 * @param {Element} canvas 
 * @returns {Promise}
 */
function makeThumbnail(file, canvas, width = 24, height = 24) {
  // returns asynchronous process
  return new Promise((resolve) => {
    try {
      const _width = canvas.getAttribute('width');
      if (_width) {
        const w = parseInt(_width, 10);
        if (w) {
          width = w;
        }
      }

      const ctx = canvas.getContext('2d')

      const reader = new FileReader()
      // const blobUrl = window.URL.createObjectURL(file.);

      reader.readAsDataURL(file)

      reader.onload = () => {
        const img = new Image()
        img.src = reader.result
        img.onload = () => {
          ctx.drawImage(img, 0, 0, width, height)
          resolve(canvas.toDataURL('image/jpeg', 0.5))
        }

        img.onerror = () => {
          throw new Error('error')
        }
      }
    } catch (err) {
      resolve(imgIcon)
    }
  })
};