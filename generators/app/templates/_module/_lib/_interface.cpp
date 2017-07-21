//=============================================================================
// Module name  : <%= defaultLibrary %>Interface.cpp
//=============================================================================

#include "stdafx.h" 

#ifdef _DEBUG
#undef THIS_FILE
static char THIS_FILE[] = __FILE__;
#endif

#define _AddOn_Interface_Of <%= defaultLibrary.toLowerCase() %>

/////////////////////////////////////////////////////////////////////////////
//					Add-On Interface Definition
/////////////////////////////////////////////////////////////////////////////
//

//-----------------------------------------------------------------------------
BEGIN_ADDON_INTERFACE()
	DATABASE_RELEASE(1)

	//-----------------------------------------------------------------------------
	BEGIN_TABLES()
		BEGIN_REGISTER_TABLES	()
		END_REGISTER_TABLES		()
	END_TABLES()

	//-----------------------------------------------------------------------------
	BEGIN_FUNCTIONS()
	END_FUNCTIONS()

	//-----------------------------------------------------------------------------
	BEGIN_HOTLINK()
	END_HOTLINK ()

	//-----------------------------------------------------------------------------
	BEGIN_TEMPLATE()
	END_TEMPLATE()

END_ADDON_INTERFACE()

#undef _AddOn_Interface_Of