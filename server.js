import bodyParser from 'body-parser';
import express from "express";
import cookieParser from 'cookie-parser';
import fs from 'fs';
import async from 'async';
import multiparty from 'multiparty';

const app = express();
app.use(cookieParser());
app.use(express.static('static'));
app.use(bodyParser.json({ limit: '2048mb' }));
app.use(bodyParser.urlencoded({ limit: '2048mb', extended: true }));

app.post('/file/uploading', function(req, res, next) {/* 生成multiparty对象，并配置上传目标路径 */var form = new multiparty.Form();
  /* 设置编辑 */
  form.encoding = 'utf-8';
  //设置文件存储路劲
  form.uploadDir = './files';
  //设置文件大小限制
  form.maxFilesSize = 2 * 1024 * 1024;
  res.json({ msg: '数据已接收', code: 1 });
  // form.maxFields = 1000;   //设置所有文件的大小总和//上传后处理
  form.parse(req, function(err, fields, files) {var filesTemp = JSON.stringify(files, null, 2);

      if(err) {
          console.log('parse error:' + err);
      }else {
          console.log('parse files:' + filesTemp);
          console.log('file:', files.file);
          async.eachSeries(files.file, (item, fileCallback) => {
            const uploadedPath = item.path;
            const dstPath = './files/' + item.originalFilename;
            //重命名为真实文件名
            fs.rename(uploadedPath, dstPath, function(err) {if(err) {
                  console.log('rename error:' + err);
                  fileCallback(err, false)
                }else {
                  console.log('rename ok');
                  fileCallback(null, true)
                }
            })
          }, (error, result) => {
            if (error) {
              console.log('文件处理出错', error);
            }
            console.log('文件上传成功并处理完成')
          });
      }
  })
})
app.all('*',function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With');
  res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
  if (req.method == 'OPTIONS') {
    res.send(200);
  }
  else {
    next();
  }
});

app.listen(process.env.port, function () {
  console.log(`upload center 运行在http://127.0.0.1:${process.env.port}`);
});
