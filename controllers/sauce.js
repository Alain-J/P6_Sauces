const Sauce = require('../models/Sauce');
const fs = require('fs');

exports.getAllSauces = (req, res, next) => {
    Sauce.find()
      .then(sauces => res.status(200).json(sauces))
      .catch(error => res.status(400).json({ error }));
  };

exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(404).json({ error }));
};

exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  delete sauceObject.userId;
  const sauce = new Sauce({
      ...sauceObject,
      userId: req.auth.userId,
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  });
  sauce.save()
  .then(() => { res.status(201).json({message: 'Sauce enregistré !'})})
  .catch(error => { res.status(400).json( { error })})
};

exports.modifySauce = (req, res, next) => {
  const sauceObject = req.file ? {
      ...JSON.parse(req.body.sauce),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  } : { ...req.body };
  delete sauceObject.userId;
  Sauce.findOne({_id: req.params.id})
      .then((sauce) => {
          if (sauce.userId != req.auth.userId) {
              res.status(401).json({ message : 'Non autorisé'});
          } else {
              Sauce.updateOne({ _id: req.params.id}, { ...sauceObject, _id: req.params.id})
              .then(() => res.status(200).json({message : 'Sauce modifié!'}))
              .catch(error => res.status(401).json({ error }));
          }
      })
      .catch((error) => {
          res.status(400).json({ error });
      });
};

exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id})
      .then(sauce => {
          if (sauce.userId != req.auth.userId) {
              res.status(401).json({message: 'Non autorisé'});
          } else {
              const filename = sauce.imageUrl.split('/images/')[1];
              fs.unlink(`images/${filename}`, () => {
                  Sauce.deleteOne({_id: req.params.id})
                      .then(() => { res.status(200).json({message: 'Sauce supprimé !'})})
                      .catch(error => res.status(401).json({ error }));
              });
          }
      })
      .catch( error => {
          res.status(500).json({ error });
      });
};

exports.likeSauce = (req , res, nest) => {
    const userId = req.body.userId;
    const like = req.body.like;

    if (like === 1 ) {
        Sauce.updateOne({ _id: req.params.id}, { $push: { usersLiked: userId}, $inc: { likes: +1}})
        .then(() => { res.status(200).json({message: ' Like ajoutée !'})})
        .catch(error => res.status(401).json({ error }));

    } else if (like === 0) {
        Sauce.findOne({ _id: req.params.id})       
        .then(sauce => {
            if (sauce.usersLiked.includes(userId)) {
                Sauce.updateOne({ _id: req.params.id}, { $pull: { usersLiked: userId}, $inc: { likes: -1}})
                .then(() => { res.status(200).json({message: ' Like annulée !'})})
                .catch(error => res.status(401).json({ error }));
            } else {
                Sauce.updateOne({ _id: req.params.id}, { $pull: { usersDisliked: userId}, $inc: { dislikes: -1}})
                .then(() => { res.status(200).json({message: ' disLike annulée !'})})
                 .catch(error => res.status(401).json({ error }));
            }
        }) 
    } else {
        Sauce.updateOne({ _id: req.params.id}, { $push: { usersDisliked: userId}, $inc: { dislikes: +1}})
        .then(() => { res.status(200).json({message: ' disLike ajoutée !'})})
        .catch(error => res.status(401).json({ error }));
    }

}