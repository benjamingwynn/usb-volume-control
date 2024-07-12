#!/bin/bash
set -e

if [ "$EUID" -ne 0 ]; then
  echo "This script must be run as root. Please use sudo."
  exit 1
fi

#
echo ""
echo "** Updating system"
echo ""

apt update -y
apt upgrade -y

#
echo ""
echo "** Removing desktop environment"
echo ""

apt purge -y xserver* lightdm* raspberrypi-ui-mods vlc* lxde* chromium* desktop* gnome* gstreamer* gtk* hicolor-icon-theme* lx* mesa*
apt autoremove -y

#
echo ""
echo "** Enabling required kernel modules"
echo ""

modprobe dwc2
modprobe libcomposite
echo "dwc2" >> /etc/modules
echo "libcomposite" >> /etc/modules

#
echo ""
echo "** Adding dtoverlay=dwc2 to boot firemware config"
echo ""

echo "dtoverlay=dwc2" >> /boot/firmware/config.txt

#
echo ""
echo "** Installing node.js for the daemon runtime"
echo ""

apt install nodejs -y

#
echo ""
echo "** Install the daemon to /opt/usb-volume-control/daemon"
echo ""

mkdir -pv /opt/usb-volume-control
cp -r daemon /opt/usb-volume-control/daemon

#
echo ""
echo "** Installing the mkdevice script to /opt/usb-volume-control/mkdevice.sh"
echo ""
cp -r mkdevice.sh /opt/usb-volume-control/mkdevice.sh

#
echo ""
echo "** Installing and enabling systemd services"
echo ""
cp -rv systemd/*.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable usb-volume-control-init.service
systemctl enable usb-volume-control-daemon.service

# TODO: disable SSH and wifi, and delete wifi+ssh credentails, (self-airgap)
# #
# echo ""
# echo "** "
# echo ""

echo ""
echo ""
echo ""
echo ""
echo "** SUCCESS! usb-volume-control has been installed on this raspberry pi"
echo "   This Pi will reboot in 20 seconds, at which point the GPIO pins configured"
echo "   in the daemon (20 & 21 by default) will be used for volume up/down, and"
echo "   the Pi wil appear as a keyboard on your computer."
echo ""
echo ""
echo ""
sleep 17
echo "...3"
sleep 1
echo "...2"
sleep 1
echo "...1"
sleep 1
echo "...0!"
reboot