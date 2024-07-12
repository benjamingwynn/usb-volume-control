#!/bin/bash

cd /sys/kernel/config/usb_gadget/

dmesg > /tmp/1

mkdir -p keyboard
cd keyboard

START_TIME=$(date +"%Y-%m-%d %H:%M:%S")
echo "creating..."
echo 0x1d6b > idVendor # Linux Foundation
echo 0x0104 > idProduct # Multifunction Composite Gadget
echo 0x0100 > bcdDevice # v1.0.0
echo 0x0200 > bcdUSB # USB2

mkdir -p strings/0x409
echo "000006900420" > strings/0x409/serialnumber
echo "benjamingwynn's" > strings/0x409/manufacturer
echo "Generic USB Keyboard" > strings/0x409/product

mkdir -p configs/c.1/strings/0x409
echo 250 > configs/c.1/MaxPower

# register generic keyboard
mkdir -p functions/hid.usb0
# https://github.com/mtlynch/ansible-role-key-mime-pi/blob/master/files/enable-rpi-hid
echo 1 > functions/hid.usb0/protocol
echo 0 > functions/hid.usb0/subclass # conflicting info if this should be 1 or 0
echo 8 > functions/hid.usb0/report_length
# remote control thing
# see: https://github.com/DevOps-Nirvana/python-usb-gadget-send-multimedia-hid-commands?tab=readme-ov-file
echo -ne \\x05\\x01\\x09\\x06\\xa1\\x01\\x05\\x07\\x19\\xe0\\x29\\xe7\\x15\\x00\\x25\\x01\\x75\\x01\\x95\\x08\\x81\\x02\\x95\\x01\\x75\\x08\\x81\\x03\\x95\\x05\\x75\\x01\\x05\\x08\\x19\\x01\\x29\\x05\\x91\\x02\\x95\\x01\\x75\\x03\\x91\\x03\\x95\\x06\\x75\\x08\\x15\\x00\\x25\\x65\\x05\\x07\\x19\\x00\\x29\\x65\\x81\\x00\\xc0\\x05\\x0c\\x09\\x01\\xa1\\x01\\x85\\x02\\x05\\x0c\\x15\\x00\\x25\\x01\\x75\\x01\\x95\\x07\\x09\\xb5\\x09\\xb6\\x09\\xb7\\x09\\xcd\\x09\\xe2\\x09\\xe9\\x09\\xea\\x81\\x02\\x95\\x01\\x81\\x01\\xc0 > functions/hid.usb0/report_desc

ln -s functions/hid.usb0 configs/c.1/

echo "enabling..."
name="$(ls /sys/class/udc)"
echo "$name" > UDC

echo "..."
dmesg > /tmp/2
diff /tmp/1 /tmp/2
rm /tmp/1 /tmp/2

sleep 1
chmod 777 /dev/hidg*