+++
title = 'Infinity FM-Towns Driver'
date = 2025-11-27T00:31:09-05:00
draft = false
+++

INFINITY Co.,Ltd., a studio that ported games to the FMTowns system, used a small FMTowns graphics wrapper to assist with this.

I'm actually not sure if this is something that was written by INFINITY or was provided in an SDK for FMTowns, but I did find it with one of their ports.



The file has no standard header and begins with a 26-entry long jump table:

```nasm
   |_ram:00000000    [0]             addr        drv_InitWithReloc                       
   |_ram:00000004    [1]             addr        drv_ShutDown                            
   |_ram:00000008    [2]             addr        drv_Nop1                                
   |_ram:0000000c    [3]             addr        drv_GetPageSize                         
   |_ram:00000010    [4]             addr        drv_PageFlip                            
   |_ram:00000014    [5]             addr        drv_SwapBuffers                         
   |_ram:00000018    [6]             addr        drv_SetPalette                          
   |_ram:0000001c    [7]             addr        drv_FillRect                            
   |_ram:00000020    [8]             addr        drv_CopyRect                            
   |_ram:00000024    [9]             addr        drv_PutPixel                            
   |_ram:00000028    [10]            addr        drv_GetPixel                            
   |_ram:0000002c    [11]            addr        drv_BlockCopy                           
   |_ram:00000030    [12]            addr        drv_DrawLine                            
   |_ram:00000034    [13]            addr        drv_BlitTransparent                     
   |_ram:00000038    [14]            addr        drv_Nop2                                
   |_ram:0000003c    [15]            addr        drv_BlitOpaque                          
   |_ram:00000040    [16]            addr        drv_DrawSprite                          
   |_ram:00000044    [17]            addr        drv_DrawSpriteAlt                       
   |_ram:00000048    [18]            addr        drv_Blit1bpp                            
   |_ram:0000004c    [19]            addr        drv_CopyScanline                        
   |_ram:00000050    [20]            addr        drv_BlitRect                            
   |_ram:00000054    [21]            addr        drv_BlitRect                            
   |_ram:00000058    [22]            addr        drv_SetFontMetrics                      
   |_ram:0000005c    [23]            addr        drv_DrawText                            
   |_ram:00000060    [24]            addr        drv_CopyScanlineBoth                    
   |_ram:00000064    [25]            addr        drv_Nop3                                

```

It is loaded dynamically at runtime.



Here are some of my findings:

### 1. Relocation and Dynamic Loading

The most immediate characteristic of this driver is its self-relocation mechanism. The function at index 0, `drv_InitWithReloc`, reveals that the code is designed to be position-independent but requires a one-time setup to function correctly.

```nasm
; undefined drv_InitWithReloc(void)
ram:000001c2    e843ffffff      CALL        drv_InternalVideoSetup
ram:000001c7    0bc0            OR          EAX,EAX
ram:000001c9    7411            JZ          LAB_000001dc
ram:000001cb    b968000000      MOV         ECX,0x68    ; 26 entries * 4 bytes
ram:000001d0    c1e902          SHR         ECX,0x2
ram:000001d3    8bfb            MOV         EDI,EBX     ; EBX is likely the load address
LAB_000001d5:
ram:000001d5    011f            ADD         dword ptr [EDI],EBX
ram:000001d7    83c704          ADD         EDI,0x4
ram:000001da    e2f9            LOOP        LAB_000001d5
```

The routine iterates through the initial 26-entry jump table, adding the base load address (passed in `EBX`) to each entry. This implies the main executable allocates a block of memory, loads this binary blob, and then calls the first instruction with the allocated address in `EBX` to "patch" the driver into validity.

### 2. Software Line-Doubling

A distinct feature of the drawing routines is the implementation of software-based scanline doubling. An examination of `drv_FillRect` and `drv_CopyScanline` shows a specific memory access pattern:

```nasm
; From drv_FillRect
ram:000002b8    2bfa            SUB         EDI,param_2
ram:000002ba    81c700040000    ADD         EDI,0x400
; ... repeat store operation ...
; From drv_CopyScanline
ram:000006b3    81c500080000    ADD         EBP,0x800
```

The driver operates with a virtual stride of 1024 bytes (`0x400`). However, primitive drawing operations write to the target offset `Y`, add `0x400` to write the same data to `Y+1`, and then add `0x800` to the base pointer to advance to the next logical line.

Rather than relying on hardware scaling, the driver "doubles" the height by drawing every line twice explicitly in VRAM.

### 3. Shift-JIS Character Support

The driver contains a robust text rendering engine, specifically tailored for Japanese text. `drv_DrawText` (offset `0x005c`) performs boundary checks consistent with Shift-JIS encoding:

```nasm
ram:0000087d    3c81            CMP         param_1,0x81
ram:0000087f    7216            JC          LAB_00000897 ; ASCII/Half-width
ram:00000881    3c9f            CMP         param_1,0x9f
ram:00000883    7608            JBE         LAB_0000088d ; Shift-JIS Lead Byte
```

### 4. Hardware Port Utilization

The driver manipulates the Towns' unique video hardware directly via I/O ports, rather than relying solely on BIOS calls.

* **Ports 0x440/0x442:** Used in `drv_PageFlip` to toggle display pages, indicating a double-buffered rendering setup.
* **Ports 0xFD90-0xFD9F:** Accessed in `drv_SetPalette`. These correspond to the FM Towns palette registers.
* **Ports 0x58/0x5A:** The `drv_InternalVideoSetup` function writes to these ports, which usually control the CRTC (Cathode Ray Tube Controller) priority and layer mixing, likely ensuring the graphical layer used by the game overlays correctly on top of the system background.

Not all of this has been fact-checked nor am I an expert at FM-Towns.
