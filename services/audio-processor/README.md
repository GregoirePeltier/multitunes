# Audio Processor
_this pacakge is the audio processing runner for the Multitune website_

_It's purpose is to unstack audio processing jobs to prepare tracks for the quizzes_

## Installation
### Development
If you have a cpu only machine (or cuda < 11) you must run :
```bash
    pip install -r requirements-cpu.txt
    pip install -r requirements-dev.txt
```
otherwise just run 
```bash
    pip install -r requirements-dev.txt
```

This is because we need to explicitly install torch cpu version to avoid problems

### Production
============= TODO ==============