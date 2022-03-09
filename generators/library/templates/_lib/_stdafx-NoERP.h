#include <TbPchStub\stdafx.h>

#include <TbFrameworkImages\CommonImages.h>
#include <TbFrameworkImages\GeneralFunctions.h>

#include <TbGeneric\globals.h>
#include <TbGeneric\array.h>
#include <TbGeneric\DataObj.h>
#include <TbGeneric\GeneralFunctions.h>
#include <TbGeneric\TBThemeManager.h>
#include <TbGeneric\CheckRecursion.h>

#include <TbNameSolver/CallbackHandler.h>

#include <TbGenlib\messages.h>
#include <TbGenlib\TbCommandInterface.h>
#include <TbGenlib\TBCaptionBar.h>
#include <TbGenlib\TBDockPane.h>
#include <TbGenlib\TBSplitterWnd.h>
#include <TbGenlib\TBPropertyGrid.h>

#include <TbOleDb\sqlrec.h>
#include <TbOleDb\sqlconnect.h>
#include <TbOleDb\sqltable.h>

#include <TbWoormViewer\woormdoc.h>

#include <TbResourcesMng\RMEnums.h>
#include <TbResourcesMng\TAbsenceReasons.h>
#include <TbResourcesMng\TCalendars.h>
#include <TbResourcesMng\TResources.h>
#include <TbResourcesMng\TWorkers.h>

#include <TbGes\interfacemacros.h>
#include <TbGes\tblread.h>
#include <TbGes\tblupdat.h>
#include <TbGes\dbt.h> 
#include <TbGes\hotlink.h>
#include <TBGes\TileManager.h>
#include <TBGes\TileDialog.h>
#include <TBGes\HeaderStrip.h>
#include <TbGes\tabber.h>
#include <TbGes\bodyedit.h>
#include <TbGes\FormMng.h>
#include <TbGes\EventMng.h>
#include <TbGes\extdoc.h>
#include <TbGes\JsonFormEngineEx.h> 
#include <TbGes\JsonFrame.h>

#include <TbGes\BusinessObjectInterface.h>
#include <TbGes\BusinessServiceProvider.h>
#include <TbGes\UIBusinessServiceProvider.h> 

#include <TbGes\TBActivityDocument.h>
#include <TbGes\TBBaseNavigation.h>

#include <TbGes\HotFilter.h>
#include <TbGes\HotFilterManager.h>

#include <TbGes\HotFilterDataPicker.h>
#include <TbGes\UIHotFilterDataPicker.h>

#include <TBGes\UITileDialog.hjson>

#pragma warning(disable:4355) // disabilita la warning sull'uso del this del parent

#ifdef _DEBUG
#define new DEBUG_NEW
#define DataObjCreate(dt) DataObjCreate(dt, THIS_FILE, __LINE__)
#define DataObjClone() DataObjClone(THIS_FILE, __LINE__)
#endif