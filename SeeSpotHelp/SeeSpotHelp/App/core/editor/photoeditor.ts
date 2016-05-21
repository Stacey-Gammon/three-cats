
import DataServices from '../dataservices';
import Photo from '../databaseobjects/photo';
import Activity from '../databaseobjects/activity';
import AnimalStore from '../../stores/animalstore';
import GroupStore from '../../stores/groupstore';
import LoginStore from '../../stores/loginstore';

import InputPhotoField from './inputphotofield';
import InputTextAreaField from './inputtextareafield';
import InputCheckBoxField from './inputcheckboxfield';
import InputFieldValidation from './inputfieldvalidation';
import { Editor } from './editor';

import Promise = require('bluebird');
var Firebase = require('firebase');

const FULL_SIZE = {
  maxDimension: 1280,
  quality: 0.9
};

const THUMBNAIL_SIZE = {
  maxDimension: 100,
  quality: 0.6
};

export default class PhotoEditor extends Editor {
  public databaseObject: Photo;
  private storage: any;

  constructor(photo) {
    super(photo);
    this.storage = Firebase.storage();
    this.addPolyfills();
  }

  getInputFields() { return this.inputFields; }

  // Taken from FriendlyPix firebase sample:
  addPolyfills() {
    // Polyfill for canvas.toBlob().
    //if (!HTMLCanvasElement.prototype.toBlob) {
      Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
        value: function(callback, type, quality) {
          var binStr = atob(this.toDataURL(type, quality).split(',')[1]);
          var len = binStr.length;
          var arr = new Uint8Array(len);

          for (var i = 0; i < len; i++) {
            arr[i] = binStr.charCodeAt(i);
          }

          callback(new Blob([arr], {type: type || 'image/png'}));
        }
      });
  //  }
  }

  /**
   * Returns a Canvas containing the given image scaled down to the given max dimension.
   * @private
   * @static
   */
  static _getScaledCanvas(image, maxDimension) {
    let thumbCanvas = document.createElement('canvas');
    if (image.width > maxDimension ||
      image.height > maxDimension) {
      if (image.width > image.height) {
        thumbCanvas.width = maxDimension;
        thumbCanvas.height = maxDimension * image.height / image.width;
      } else {
        thumbCanvas.width = maxDimension * image.width / image.height;
        thumbCanvas.height = maxDimension;
      }
    } else {
      thumbCanvas.width = image.width;
      thumbCanvas.height = image.height;
    }
    thumbCanvas.getContext('2d').drawImage(image, 0, 0, image.width, image.height,
      0, 0, thumbCanvas.width, thumbCanvas.height);
    return thumbCanvas;
  }

  generateImagesFromUrl(url) {
    let image = new Image();
    image.src = url;
    var thumbPromise = new Promise(function(resolve, reject) {
        // Generate thumb.
        let maxThumbDimension = THUMBNAIL_SIZE.maxDimension
        let thumbCanvas = PhotoEditor._getScaledCanvas(image, maxThumbDimension);
        thumbCanvas.toBlob(function(blob) {
          resolve(blob);
        }, 'image/jpeg', THUMBNAIL_SIZE.quality);
    });

    var fullPromise = new Promise(function(resolve, reject) {
        // Generate full sized image.
        let maxFullDimension = FULL_SIZE.maxDimension;
        let fullCanvas = PhotoEditor._getScaledCanvas(image, maxFullDimension);
        fullCanvas.toBlob(function(blob) {
          resolve(blob);
        }, 'image/jpeg', FULL_SIZE.quality);
    });

    var promise = Promise.all([thumbPromise, fullPromise]);
    return promise;
  }

  /**
   * Generates the full size image and image thumb using canvas and returns them in a promise.
   */
  generateImages(file) {
    let me = this;
    return new Promise(function (resolve, reject) {
      let reader = new FileReader();
      reader.onload = function (e) {
        resolve(e.target.result);
      };
      reader.readAsDataURL(file);
    }).then(function(result) {
      return me.generateImagesFromUrl(result);
    });
  }

  insert(extraFields, onError, onSuccess) {
    var photo = this.databaseObject;
    this.generateImages(photo.file).then(function(blobs) {
      DataServices.UploadPhoto(blobs[0], blobs[1], photo.file.name, extraFields.userId).then(
        function(result) {
          extraFields.fullUrl = result[0];
          extraFields.thumbUrl = result[1];
          this.insertPhoto(extraFields, onError, onSuccess);
      }.bind(this));
    }.bind(this));
  }

  insertPhoto(extraFields, onError, onSuccess) {
    var photo = new Photo()
    photo.updateFromInputFields(this.inputFields);
    photo.groupId = extraFields.groupId;
    photo.animalId = extraFields.animalId;
    photo.userId = extraFields.userId;
    photo.fullSizeUrl = extraFields.fullUrl;
    photo.thumbnailUrl = extraFields.thumbUrl;
    photo.insert();

    if (extraFields.headShot) {
      if (photo.animalId) {
        var animal = AnimalStore.getAnimalById(photo.animalId);
        if (animal) {
          animal.photoId = photo.id;
          animal.update();
        }
      } else if (photo.groupId) {
          var group = GroupStore.getItemById(photo.groupId);
          if (group) {
            group.photoId = photo.id;
            group.update();
          }
      } else {
        LoginStore.getUser().photoId = photo.id;
        LoginStore.getUser().update();
      }
    }

    if (photo.animalId) {
      var activity = Activity.CreatePhotoActivity(photo);
      activity.insert();
    }

    this.databaseObject = photo;
    onSuccess();
  }

  update() {
    this.databaseObject.updateFromInputFields(this.inputFields);
    this.databaseObject.update();
  }

  createInputFields() {
    this.inputFields = {
      'src': new InputPhotoField(
        this.databaseObject.src, [InputFieldValidation.validateNotEmpty]),
      'comment': new InputTextAreaField([])
    };
  }
}
