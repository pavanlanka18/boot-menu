# Omarchy + Windows Dual-Boot Setup

A repeatable checklist for installing **Omarchy alongside Windows** and making sure the machine shows a **10-second boot menu** with both Omarchy and Windows.

> **Current Omarchy:** Limine is the default bootloader. Use `limine-scan` to add Windows to the Limine menu.  
> Official guide: https://omarchy.org/manual/dual-boot-install/

---

## 0. Before Installing

### Windows

1. Back up important files.
2. Open **Disk Management**.
3. Shrink the Windows partition and create **unallocated/free space** for Omarchy.
4. Disable BitLocker / Device Encryption before installing Omarchy.

Check BitLocker from an Administrator PowerShell:

```powershell
manage-bde -status
```

Look for the Windows OS drive and confirm:

```text
Conversion Status: Fully Decrypted
```

### BIOS / UEFI

Before booting the Omarchy USB:

- Boot mode: **UEFI**
- Disable **Secure Boot**
- Disable TPM if the installer requires it
- Make sure the Windows installation is not being wiped

---

# 1. Install Omarchy

Boot from the Omarchy USB.

When selecting the installation disk:

> **Choose `Free space install`**

Do **not** choose a full-disk installation when keeping Windows.

The intended layout is:

```text
SSD
├── Windows EFI
├── Windows
├── Windows Recovery
└── Free space
    └── Omarchy
```

Complete the Omarchy installation normally.

---

# 2. First Boot

Boot into Omarchy.

Open a terminal:

```bash
```

Confirm that Limine is installed:

```bash
sudo ls /boot
```

You should normally find a Limine configuration somewhere under `/boot`.

Find it with:

```bash
sudo find /boot -name 'limine.conf' -print
```

---

# 3. Add Windows to the Boot Menu

Run:

```bash
sudo limine-scan
```

Follow the prompts and add:

```text
Windows Boot Manager
```

If `limine-scan` is unavailable, try:

```bash
sudo limine-entry-tool --scan
```

Then verify that Windows was added:

```bash
sudo grep -A8 -i "Windows" /boot/limine.conf
```

If your configuration is stored somewhere else, use the path returned by:

```bash
sudo find /boot -name 'limine.conf' -print
```

---

# 4. Verify the UEFI Boot Order

Run:

```bash
sudo efibootmgr
```

You want the Omarchy/Limine boot entry to appear **before Windows Boot Manager** in:

```text
BootOrder:
```

Example:

```text
BootOrder: 0003,0005,0000,2001,2002,2003
```

Where:

```text
0003 = Omarchy / Limine
0005 = Windows Boot Manager
```

The important rule is:

```text
Limine first
Windows second
```

If Windows is first, the firmware may boot Windows directly and never show the Limine menu.

Set the order using the IDs shown by `efibootmgr`:

```bash
sudo efibootmgr -o <LIMINE_ID>,<WINDOWS_ID>,<OTHER_IDS>
```

Example:

```bash
sudo efibootmgr -o 0003,0005,0000,2001,2002,2003
```

**Do not blindly copy the example IDs.** They can differ between laptops.

---

# 5. Set a 10-Second Boot Menu

Find the Limine configuration:

```bash
sudo find /boot -name 'limine.conf' -print
```

Open the file. For example:

```bash
sudo nano /boot/limine.conf
```

Find:

```text
timeout:
```

Set it to:

```text
timeout: 10
```

This gives you approximately **10 seconds** to choose an entry before the default entry boots.

If there is no `timeout:` line, add it in the appropriate top-level configuration section.

Save:

```text
Ctrl + O
Enter
Ctrl + X
```

---

# 6. Final Verification

Run:

```bash
sudo efibootmgr
```

Confirm:

```text
BootOrder: <LIMINE>,<WINDOWS>,...
```

Then check the Limine configuration:

```bash
sudo grep -i -A8 "Windows" /boot/limine.conf
```

Check the timeout:

```bash
sudo grep -i "timeout" /boot/limine.conf
```

Expected:

```text
timeout: 10
```

---

# 7. Reboot

```bash
sudo reboot
```

Expected startup:

```text
UEFI
  ↓
Limine
  ↓
┌─────────────────────────────┐
│ Omarchy                     │
│ Windows Boot Manager        │
│ ...                         │
└─────────────────────────────┘
       ↓
   10 seconds
```

You should now be able to select:

- **Omarchy**
- **Windows Boot Manager**

---

# Troubleshooting

## Windows does not appear

Run:

```bash
sudo limine-scan
```

Then:

```bash
sudo grep -i -A8 "Windows" /boot/limine.conf
```

If it still does not appear, check that the Windows EFI file exists.

Find Windows EFI partitions:

```bash
lsblk -f
```

A Windows EFI partition is normally:

```text
vfat / FAT32
```

After mounting the Windows EFI partition, the bootloader should contain:

```text
EFI/Microsoft/Boot/bootmgfw.efi
```

### Important: EFI path case

If Limine reports that the Windows EFI image cannot be found, inspect the generated path carefully.

For example:

```text
/EFI/MICROSOFT/BOOT/BOOTMGFW.EFI
```

may fail if the actual FAT filesystem path is:

```text
/EFI/Microsoft/Boot/bootmgfw.efi
```

Correct the path/casing in the Limine configuration if necessary.

---

## Laptop boots Windows directly

Run:

```bash
sudo efibootmgr
```

Look at:

```text
BootOrder:
```

If Windows is first:

```text
BootOrder: 0005,0003,...
```

change it so Limine is first:

```bash
sudo efibootmgr -o 0003,0005,...
```

Use the actual IDs from your laptop.

---

## Boot menu appears but disappears too quickly

Check:

```bash
sudo grep -i "timeout" /boot/limine.conf
```

Set:

```text
timeout: 10
```

Then reboot:

```bash
sudo reboot
```

---

## Do NOT install GRUB just for this

For current Omarchy installations, **Limine is the default bootloader**.

The normal Omarchy workflow is:

```bash
sudo limine-scan
```

then verify the UEFI boot order and configure the Limine timeout.

There is normally no reason to replace Limine with GRUB just to dual-boot Windows.

---

# Quick Copy-Paste Checklist

Use this after every Omarchy + Windows installation:

```bash
# 1. Find Limine config
sudo find /boot -name 'limine.conf' -print

# 2. Scan for Windows
sudo limine-scan

# If unavailable:
# sudo limine-entry-tool --scan

# 3. Verify Windows entry
sudo grep -i -A8 "Windows" /boot/limine.conf

# 4. Check UEFI boot order
sudo efibootmgr

# 5. Set Limine first
# Replace IDs with the IDs from your laptop:
sudo efibootmgr -o <LIMINE_ID>,<WINDOWS_ID>,<OTHER_IDS>

# 6. Edit Limine configuration
sudo nano /boot/limine.conf

# Set:
# timeout: 10

# 7. Verify timeout
sudo grep -i "timeout" /boot/limine.conf

# 8. Reboot
sudo reboot
```

---

# Target Result

Every configured laptop should boot like this:

```text
Power On
   ↓
UEFI
   ↓
Limine
   ↓
10-second menu
   ├── Omarchy
   └── Windows Boot Manager
```

## Official References

- Omarchy Dual Boot: https://omarchy.org/manual/dual-boot-install/
- Omarchy Getting Started: https://omarchy.org/manual/getting-started/
- Omarchy Manual: https://omarchy.org/manual/
