# Encrypting Google Sheets

The purpose of this code is to encrypt your data in google sheets using Google Apps Scripts. In particular, all data in your google sheet will be encrypted with a password you can create and the [Rabbit](https://en.wikipedia.org/wiki/Rabbit_(cipher)) encryption algorithm.

## Caveat: Google sheets will still not be secure due to documents Version History

Even after encrypting your data, a malicious user that has access to your google account could still access the unencrypted data by simply navigating to the Version History of the gsheet, and choosing the document version just before the encryption occurred. Sadly, Version History can not be disabled.

Accordingly, using this code to encrypt your data is not secure enough. The only solution to get rid of the Version History is to create a copy of the google sheet (copies do not keep record of Version History). So, your steps for securely keeping your data should be:

1. Encrypting your gsheet with this code.
2. Creating a copy of your encrypted gsheet.
3. Deleting the original version (and delete it from Recycle Bin, Google might keep a copy there for some time)

## Setup

Google app scripts are javascript code that directly run over your google documents. They are really cool and powerful. You can read more about it [here](https://developers.google.com/apps-script).

In order to open the google app script platform, just open your google sheet (or any other google document), and Click on Extensions -> Apps Script. That will open a new code project associated to your document.

Once you open the Script Editor, you should create new Script and HTML Files on it, and copy paste the code from the files in this repo. In particular:

* encryption.gs: Master code that manages the encryption options for the google sheet.
* Rabbit.gs: Implementation of the Rabbit encryption algorithm.
* hashing.gs: Simple code that implements sha256 hashing, used to hash passwords before saving them.

And all html files for user interface, in particular does related to creating and asking for your password:

* changepassword.html: Pop-up to change password
* inputpassworddecrypt.html: Pop-up to ask for password when encrypting
* inputpasswordencrypt.html: Pop-up to ask for password when decrypting

## How to run

After you have created all the code files, go back to your gsheet, refresh, and you will see a new 'Protect File' option in the menu bar, from where you can Encrypt your data. Whenever its your first time using the tool, please run the 'Initialize' action on the menu to authorize all necessary permissions.

## Reaching out

Please email researchsupport@poverty-action.org if you have any questions on using this code.

## References

Part of the code we used for reference was extracted from [this](http://www.skipser.com/p/2/p/password-protect-google-drive-document.html) article.
