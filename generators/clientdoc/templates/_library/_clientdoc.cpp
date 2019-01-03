
#include "stdafx.h"

#include "CD<%= clientDocName %>.h"  

#ifdef _DEBUG
#undef THIS_FILE
static char THIS_FILE[] = __FILE__;
#endif

///////////////////////////////////////////////////////////////////////////////
//	Class CD<%= clientDocName %> Implementation		
///////////////////////////////////////////////////////////////////////////////
//
//-----------------------------------------------------------------------------
IMPLEMENT_DYNCREATE(CD<%= clientDocName %>, CClientDoc)

//-----------------------------------------------------------------------------
BEGIN_MESSAGE_MAP(CD<%= clientDocName %>, CClientDoc)
END_MESSAGE_MAP()

//-----------------------------------------------------------------------------
CD<%= clientDocName %>::CD<%= clientDocName %>()
{              
}

//-----------------------------------------------------------------------------
CD<%= clientDocName %>::~CD<%= clientDocName %>()
{              
}

//-----------------------------------------------------------------------------
BOOL CD<%= clientDocName %>::OnAttachData()
{            
    return TRUE;  
}

//-----------------------------------------------------------------------------
BOOL CD<%= clientDocName %>::OnPrepareAuxData()
{
    return TRUE;  
}
