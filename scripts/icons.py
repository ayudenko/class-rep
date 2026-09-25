"""Generate original geometric book icons; no downloaded artwork or dependencies."""
from pathlib import Path
import struct, zlib

def png(path, size, splash=False):
    bg=(248,246,252) if splash else (119,96,197)
    rows=[]
    for y in range(size):
        row=bytearray()
        for x in range(size):
            u=(x/size-.5)*(3 if splash else 1)+.5
            v=(y/size-.5)*(3 if splash else 1)+.5
            book=(.22<u<.48 and .30<v<.70+.18*(u-.48)) or (.52<u<.78 and .30<v<.70-.18*(u-.52))
            row.extend((119,96,197) if book and splash else (255,255,255) if book else bg)
        rows.append(b'\0'+row)
    def chunk(t,d):return struct.pack('>I',len(d))+t+d+struct.pack('>I',zlib.crc32(t+d))
    Path(path).write_bytes(b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR',struct.pack('>IIBBBBB',size,size,8,2,0,0,0))+chunk(b'IDAT',zlib.compress(b''.join(rows)))+chunk(b'IEND',b''))
png('ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png',1024)
for p in Path('ios/App/App/Assets.xcassets/Splash.imageset').glob('*.png'):png(p,512,True)
for folder,size in [('mdpi',48),('hdpi',72),('xhdpi',96),('xxhdpi',144),('xxxhdpi',192)]:
    for name in ['ic_launcher.png','ic_launcher_round.png','ic_launcher_foreground.png']:png(f'android/app/src/main/res/mipmap-{folder}/{name}',size)
for p in Path('android/app/src/main/res').glob('drawable*/splash.png'):png(p,512,True)
