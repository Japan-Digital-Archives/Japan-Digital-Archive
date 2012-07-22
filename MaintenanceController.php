<?php

namespace JDA\CoreBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Response;

class MaintenanceController extends Controller
{
    
    public function indexAction()
    {
    
    	
        return $this->render('JDACoreBundle:Maintenance:maintenance.html.twig');
    	
    
    }
}
