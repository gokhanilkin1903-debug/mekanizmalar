import json, subprocess, sys, os
D, SRC, DST, DUR = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4]
plan = json.load(open(os.path.join(D, 'plan.json')))
ins, flt = [], []
for p in plan:
    ins += ['-i', os.path.join(D, f"seg{p['i']}.wav")]
    ms = int(p['start'] * 1000); flt.append(f"[{p['i']}]adelay={ms}|{ms}[a{p['i']}]")
mix = ''.join(f"[a{p['i']}]" for p in plan) + f"amix=inputs={len(plan)}:normalize=0,apad=whole_dur={DUR}[out]"
narr = os.path.join(D, 'narr.wav')
subprocess.run(['ffmpeg','-v','error','-y',*ins,'-filter_complex',';'.join(flt+[mix]),'-map','[out]','-t',DUR,'-ar','44100',narr],check=True)
subprocess.run(['ffmpeg','-v','error','-y','-i',SRC,'-i',narr,'-map','0:v','-map','1:a','-c:v','copy','-c:a','aac','-b:a','192k','-shortest','-movflags','+faststart',DST],check=True)
