
#include "stdafx.h"

// library declaration
#include <<%= moduleName %>\<%= dblName %>\<%= tableName %>.h>

// local declaration
#include "ADM<%= documentName %>.h" 

#ifdef _DEBUG
#undef THIS_FILE
static char THIS_FILE[] = __FILE__;
#endif

/////////////////////////////////////////////////////////////////////////////
//								### ADM ###					
/////////////////////////////////////////////////////////////////////////////
//
IMPLEMENT_ADMCLASS(ADM<%= documentName %>Obj)