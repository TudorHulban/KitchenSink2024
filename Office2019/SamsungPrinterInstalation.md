### Verify dependencies
Verify if `cups` is installed:
```bash
sudo systemctl status cups
```
If not present install:
```
sudo apt install cups
```
Start the service:
```bash
sudo systemctl start cups  # or sudo /etc/init.d/cupsd start
```

### Install driver
1. download driver (with git clone)
2. unarchive driver:
```bash
tar -xvf printer.tar.gz
```
3. install driver with sudo rights:
```bash
sudo ./install.sh
```

### Add printer
Add printer from OS settings. The printer should be recognized as the driver was installed.<br/>
Verify printing test page.


### Resources
```
https://www.maketecheasier.com/set-up-a-printer-in-linux/
```
