import 'dotenv/config';

const {exec} = require('child_process');
const fs = require('fs');

const processSound = (req, res) => {
  const sound = req.file;

  if (!sound) {
    res.status(400).send("File does not exist");
  } else {
    exec(`${process.env.OCTAVE_PATH} sound_processing\\stress_detection_script.m WEB_APP ${sound.path} aspirin`,
      (err, stdout, stderr) => {
        fs.unlinkSync(sound.path);
        if (err) {
          console.log(stderr);
          return;
        }
        console.log(stdout);
        res.send(stdout);
      });
  }
};

module.exports = processSound;