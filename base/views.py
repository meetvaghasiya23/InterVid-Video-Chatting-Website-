#from typing_extensions import Self
from django.shortcuts import render
from django.http import JsonResponse
import random
import time
import json
from .models import RoomMember
from agora_token_builder import RtcTokenBuilder
from django.views.decorators.csrf import csrf_exempt

# Super user password : Manish@sqlite24
# Super user email : mmprajapaty@gmail.com

import json
from django.views.decorators.csrf import csrf_exempt

# Create your views here.

def getToken(request):
    #appId = '4007ff5b7fbe4d62834c196d450116b4'
    #appCertificate = '181ac2031a8e41ef8611e2bd3532378b'
    appId='4007ff5b7fbe4d62834c196d450116b4'
    appCertificate = '181ac2031a8e41ef8611e2bd3532378b'
    channelName = request.GET.get('channel')
    uid = random.randint(1, 234)
    expirationTimeInSeconds = 3600 * 12
    currentTimeStamp = int(time.time())
    privilegeExpiredTs = currentTimeStamp + expirationTimeInSeconds
    role = 1  # role: 1 then HOST else for role:2 GUEST


    token = RtcTokenBuilder.buildTokenWithUid(appId, appCertificate, channelName, uid, role, privilegeExpiredTs)
    return JsonResponse({'token':token, 'uid':uid}, safe=False)

def lobby(request):
    return render(request, 'base/lobby.html')

def room(request):
    return render(request, 'base/room.html')

@csrf_exempt
def createMember(request):
    data = json.loads(request.body)
    member, created = RoomMember.objects.get_or_create(
        name = data['name'],
        uid = data['UID'],
        room_name = data['room_name']
    )
    return JsonResponse({'name':data['name']}, safe=False)

def getMember(request):
    uid = request.GET.get('UID')
    room_name = request.GET.get('room_name')

    member = RoomMember.objects.get(
        uid=uid,
        room_name=room_name,
    )

    name=member.name
    return JsonResponse({'name':member.name}, safe=False)

@csrf_exempt
def deleteMember(request):
    data = json.loads(request.body)

    member = RoomMember.objects.get(
        name=data['name'],
        uid=data['UID'],
        room_name=data['room_name']
    )
    member.delete()
    return JsonResponse('Member was deleted', safe=False)