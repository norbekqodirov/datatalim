"""Restore the encrypted local state shipped with a project repository."""
import argparse,base64,hashlib,io,json,zipfile
from pathlib import Path,PurePosixPath
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

def main():
 parser=argparse.ArgumentParser(description=__doc__)
 parser.add_argument('--key-file',required=True,type=Path)
 parser.add_argument('--destination',type=Path)
 parser.add_argument('--check-only',action='store_true')
 parser.add_argument('--overwrite',action='store_true')
 args=parser.parse_args()
 transfer=Path(__file__).resolve().parent
 manifest=json.loads((transfer/'manifest.json').read_text(encoding='utf-8'))
 key=base64.b64decode(args.key_file.read_text(encoding='utf-8').strip(),validate=True)
 if len(key)!=32:raise ValueError('The key must contain 32 bytes encoded as base64.')
 aes=AESGCM(key);pieces=[]
 for index,part in enumerate(manifest['parts']):
  name=part['file']
  if Path(name).name!=name:raise ValueError('Unsafe part name')
  blob=(transfer/name).read_bytes()
  if hashlib.sha256(blob).hexdigest()!=part['sha256']:raise ValueError('Damaged encrypted part: '+name)
  if blob[:8]!=b'PRJSTATE':raise ValueError('Unknown archive format')
  pieces.append(aes.decrypt(blob[8:20],blob[20:],f"{manifest['project']}:{index}".encode()))
 archive=b''.join(pieces)
 if hashlib.sha256(archive).hexdigest()!=manifest['archive_sha256']:raise ValueError('Damaged archive')
 destination=(args.destination or transfer.parent).resolve()
 with zipfile.ZipFile(io.BytesIO(archive)) as z:
  if z.testzip() is not None:raise ValueError('Damaged ZIP entry')
  targets=[]
  for entry in z.infolist():
   rel=PurePosixPath(entry.filename)
   if rel.is_absolute() or '..' in rel.parts or '\\' in entry.filename or ':' in entry.filename:raise ValueError('Unsafe archive path')
   target=(destination/Path(*rel.parts)).resolve()
   if not target.is_relative_to(destination):raise ValueError('Path escapes destination')
   if target.exists() and not args.overwrite and not args.check_only:
    if target.is_dir() or target.read_bytes()!=z.read(entry):raise FileExistsError(str(target)+' exists. Use --overwrite only if you intend to replace local state.')
   targets.append((entry,target))
  if args.check_only:
   print(f"Verified {len(targets)} files for {manifest['project']}; no files restored.")
   return
  for entry,target in targets:
   target.parent.mkdir(parents=True,exist_ok=True)
   target.write_bytes(z.read(entry))
  print(f"Restored {len(targets)} files into {destination}.")

if __name__=='__main__':main()
